// @includepath "~/Documents/;%USERPROFILE%Documents";
// @include "basiljs/basil.js";

// Fills the document that is open in InDesign – the template – with one
// page per folder in source/: the first folder overwrites page 1, every
// further folder gets a new page with the layout of page 1.
// On each page, the first line of text.txt goes into the frame labelled
// "title", the rest into the frame labelled "text", the first image into
// the frame labelled "image". Every
// further image gets a copy of the previous box, moved 10 px left and
// 10 px down. The whole document is exported as one PDF and stays open.

var offsetX = -10; // px, negative = to the left
var offsetY = 10;  // px, positive = down

var templateDoc;
var sourceFolder;

function setup() {
    // the template is the document that was active when the script started
    templateDoc = doc();
    if (!findLabelled(page(1), "title") || !findLabelled(page(1), "text") ||
        !findLabelled(page(1), "image")) {
        templateDoc = null;
        return;
    }
    sourceFolder = Folder.selectDialog("Select the source folder");
}

function draw() {
    if (!templateDoc) {
        alert("Open the template first (e.g. template/template.idml).\n\n" +
            "Its first page needs three frames with the script labels " +
            "\"title\", \"text\" and \"image\" (Window → Utilities → Script Label).");
        return;
    }
    if (!sourceFolder) {
        alert("No folder selected.");
        return;
    }
    units(PX);

    // every subfolder is one item
    var itemFolders = sourceFolder.getFiles(function(file) {
        return file instanceof Folder;
    });
    itemFolders.sort(byName);
    if (itemFolders.length === 0) {
        alert("No folders found in " + sourceFolder.fsName);
        return;
    }

    var templatePage = page(1);

    // clean up a previous run: image copies on page 1, pages after it
    var firstPageItems = templatePage.allPageItems;
    for (var c = firstPageItems.length - 1; c >= 0; c--) {
        if (firstPageItems[c].label === "image-copy") firstPageItems[c].remove();
    }
    if (pageCount() > 1 &&
        confirm("The document has " + pageCount() + " pages. Remove pages 2–" +
            pageCount() + " (e.g. from a previous run)?")) {
        while (pageCount() > 1) removePage(pageCount());
    }

    // copy the empty template page first, then fill the pages
    var itemPages = [templatePage];
    for (var i = 1; i < itemFolders.length; i++) {
        itemPages.push(templatePage.duplicate(LocationOptions.AT_END));
    }
    for (var j = 0; j < itemFolders.length; j++) {
        fillPage(itemPages[j], itemFolders[j]);
    }
    page(1);

    // one PDF of the whole document, named after it
    var outputFolder = new Folder(sourceFolder.parent.fsName + "/output");
    outputFolder.create();
    var pdfFile = new File(outputFolder.fsName + "/" + templateDoc.name.replace(/\.[^.]*$/, "") + ".pdf");
    app.pdfExportPreferences.pageRange = PageRange.ALL_PAGES;
    savePDF(pdfFile);

    alert(itemFolders.length + " page(s) filled, PDF saved as\n" + pdfFile.fsName +
        "\n\nThe document stays open.");
}

// Fills one page with the text and images of one folder
function fillPage(pg, itemFolder) {
    page(pg); // basil's current page – duplicate() copies onto it
    var titleBox = findLabelled(pg, "title");
    var textBox = findLabelled(pg, "text");
    var imageBox = findLabelled(pg, "image");

    // ---- text: the formatting comes from the placeholder text in the template ----
    var textFile = new File(itemFolder.fsName + "/text.txt");
    if (textFile.exists) {
        var paragraphs = readParagraphs(textFile);
        // the first paragraph is the title, the rest goes into the text box
        replaceText(titleBox, paragraphs[0] || "");
        replaceText(textBox, paragraphs.slice(1).join("\r"));
        if (titleBox.overflows || textBox.overflows) {
            println(itemFolder.name + ": the text does not fit into its box.");
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
            imageBox.label = "image-copy";  // so only the original box counts as "image"
            transform(imageBox, "translate", [offsetX, offsetY]);
        }
        imageBox.place(images[i]);
        imageBox.fit(FitOptions.FILL_PROPORTIONALLY); // fill the box, crop the rest
        imageBox.fit(FitOptions.CENTER_CONTENT);
    }
}

// Replaces the text of a frame and keeps its formatting: new text takes on
// the formatting of the text it replaces – paragraph styles as well as
// fonts, sizes or colours set directly in the template.
function replaceText(frame, str) {
    var story = frame.parentStory;
    if (story.characters.length > 0) {
        story.texts[0].contents = str;
    } else {
        story.insertionPoints[0].contents = str;
    }
}

// The first page item on a page with the given script label
// (Window → Utilities → Script Label), or null
function findLabelled(pg, name) {
    for (var i = 0; i < pg.allPageItems.length; i++) {
        if (pg.allPageItems[i].label === name) return pg.allPageItems[i].getElements()[0];
    }
    return null;
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
