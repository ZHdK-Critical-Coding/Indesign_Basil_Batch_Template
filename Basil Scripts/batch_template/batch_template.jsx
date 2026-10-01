// @includepath "~/Documents/;%USERPROFILE%Documents";
// @include "basiljs/basil.js";

// Uses the document that is open in InDesign as the template and creates
// one copy per folder in source/: the text from text.txt goes into the
// text box labelled "text", the first image into the image box labelled
// "image". Every further image gets a copy of the previous box, moved
// 10 px left and 10 px down. Each copy is exported as PDF and stays open.

var offsetX = -10; // px, negative = to the left
var offsetY = 10;  // px, positive = down

var templateDoc;
var sourceFolder;

function setup() {
    // the template is the document that was active when the script started
    templateDoc = doc();
    if (!hasLabel(templateDoc, "text") || !hasLabel(templateDoc, "image")) {
        templateDoc = null;
        return;
    }
    sourceFolder = Folder.selectDialog("Select the source folder");
}

function draw() {
    if (!templateDoc) {
        alert("Open the template first (e.g. template/template.idml).\n\n" +
            "It needs a text frame with the script label \"text\" and a " +
            "graphic frame with the script label \"image\".");
        return;
    }
    if (!sourceFolder) {
        alert("No folder selected.");
        return;
    }

    var outputFolder = new Folder(sourceFolder.parent.fsName + "/output");
    outputFolder.create();

    // export all pages, regardless of what was used last time
    app.pdfExportPreferences.pageRange = PageRange.ALL_PAGES;

    // a snapshot of the template – every item opens its own copy of it
    var templateCopy = new File(Folder.temp.fsName + "/basil_template_copy.indd");
    templateDoc.saveACopy(templateCopy);

    // every subfolder is one item
    var itemFolders = sourceFolder.getFiles(function(file) {
        return file instanceof Folder;
    });
    itemFolders.sort(byName);

    for (var i = 0; i < itemFolders.length; i++) {
        buildDocument(templateCopy, itemFolders[i], outputFolder);
    }
    templateCopy.remove();

    alert(itemFolders.length + " PDF(s) saved in\n" + outputFolder.fsName +
        "\n\nThe documents stay open, the template is unchanged.");
}

// One copy of the template for one folder: fill it, export it, leave it open
function buildDocument(templateCopy, itemFolder, outputFolder) {
    // OPEN_COPY opens the file as a new, untitled document
    doc(app.open(templateCopy, true, OpenOptions.OPEN_COPY));
    units(PX);

    // the boxes are found by their script label
    // (Window → Utilities → Script Label)
    var textBox = labels("text")[0];
    var imageBox = labels("image")[0];

    // ---- text: the formatting comes from the paragraph styles in the template ----
    var textFile = new File(itemFolder.fsName + "/text.txt");
    if (textFile.exists) {
        textBox.contents = readParagraphs(textFile).join("\r");
        applyParagraphStyle(textBox.parentStory, "Body");
        applyParagraphStyle(textBox.paragraphs[0], "Title");
        if (textBox.overflows) {
            println(itemFolder.name + ": the text does not fit into the text box.");
        }
    }

    // ---- images: the first one into the template box, then a cascade of copies ----
    var images = itemFolder.getFiles(function(file) {
        return file instanceof File && /\.(jpg|jpeg|png|tif|tiff)$/i.test(file.name);
    });
    images.sort(byName);

    for (var i = 0; i < images.length; i++) {
        if (i > 0) {
            imageBox = duplicate(imageBox); // the copy lies on top of the previous box
            transform(imageBox, "translate", [offsetX, offsetY]);
        }
        imageBox.place(images[i]);
        imageBox.fit(FitOptions.FILL_PROPORTIONALLY); // fill the box, crop the rest
        imageBox.fit(FitOptions.CENTER_CONTENT);
    }

    savePDF(new File(outputFolder.fsName + "/" + itemFolder.name + ".pdf"));
    // the document stays open, so the result can be checked and refined
}

// true if a page item in the document carries the given script label
function hasLabel(d, name) {
    for (var i = 0; i < d.pageItems.length; i++) {
        if (d.pageItems[i].label === name) return true;
    }
    return false;
}

// Reads a UTF-8 text file. Lines are joined into paragraphs,
// an empty line starts a new paragraph.
function readParagraphs(file) {
    file.encoding = "UTF-8";
    file.open("r");
    var lines = file.read().split(/\r\n|\r|\n/);
    file.close();

    var paragraphs = [];
    var current = [];
    for (var i = 0; i < lines.length; i++) {
        if (/^\s*$/.test(lines[i])) {
            if (current.length) paragraphs.push(current.join(" "));
            current = [];
        } else {
            current.push(lines[i]);
        }
    }
    if (current.length) paragraphs.push(current.join(" "));
    return paragraphs;
}

function byName(a, b) {
    return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
}
