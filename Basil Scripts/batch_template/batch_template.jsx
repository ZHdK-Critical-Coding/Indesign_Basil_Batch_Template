// @includepath "~/Documents/;%USERPROFILE%Documents";
// @include "basiljs/basil.js";

// Creates one PDF per folder in source/, based on template/template.idml:
// the text from text.txt goes into the text box labelled "text",
// the first image into the image box labelled "image". Every further image
// gets a copy of the previous box, moved 10 px left and 10 px down.

var offsetX = -10; // px, negative = to the left
var offsetY = 10;  // px, positive = down

var sourceFolder;
var templateFile;

function setup() {
    sourceFolder = Folder.selectDialog("Select the source folder");
    if (!sourceFolder) return;

    // template/template.idml next to the source folder, or ask for it
    templateFile = new File(sourceFolder.parent.fsName + "/template/template.idml");
    if (!templateFile.exists) {
        templateFile = File.openDialog("Select the InDesign template (.idml or .indt)");
    }
}

function draw() {
    if (!sourceFolder || !templateFile) {
        alert("No source folder or template selected.");
        return;
    }

    var outputFolder = new Folder(sourceFolder.parent.fsName + "/output");
    outputFolder.create();

    // export all pages, regardless of what was used last time
    app.pdfExportPreferences.pageRange = PageRange.ALL_PAGES;

    // every subfolder is one item
    var itemFolders = sourceFolder.getFiles(function(file) {
        return file instanceof Folder;
    });
    itemFolders.sort(byName);

    for (var i = 0; i < itemFolders.length; i++) {
        buildDocument(itemFolders[i], outputFolder);
    }

    alert(itemFolders.length + " PDF(s) saved in\n" + outputFolder.fsName);
}

// One document from the template for one folder: fill it, export it, close it
function buildDocument(itemFolder, outputFolder) {
    // an .idml (or .indt) opens as a new, untitled document –
    // the template itself stays unchanged
    doc(app.open(templateFile));
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
    close(false); // close without saving an .indd
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
