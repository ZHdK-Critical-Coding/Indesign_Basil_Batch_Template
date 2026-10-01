# Basil.js: Template

[Deutsch](README_DE.md)

An InDesign script that fills a layout template with content: for every
folder in `source/` it opens `template/template.idml`, puts the text from
`text.txt` into the text box and the images into the image box, and
exports a PDF. Every further image gets a copy of the box, moved 10 px to
the left and 10 px down, so the images pile up like a stack of cards. The
design lives in the template – change it in InDesign, without touching the
code. Written with [basil.js](https://basiljs2.netlify.app), a library that
brings the spirit of Processing to InDesign.

## Installation

Requirements: Adobe InDesign. The library is included in `basiljs/`
(basil.js 2.0.0-beta, build 2025-01-19; basil.js is released under the
MIT license); the script is in
`Basil Scripts/batch_template/batch_template.jsx`.

1. Basil scripts load the library with these two lines:
   ```js
   // @includepath "~/Documents/;%USERPROFILE%Documents";
   // @include "basiljs/basil.js";
   ```
   InDesign therefore expects the library in `~/Documents/basiljs`. The
   easiest way is a symbolic link:
   ```sh
   ln -s "/path/to/Indesign_Basil_Batch_Template/basiljs" ~/Documents
   ```
   If `~/Documents/basiljs` already exists (e.g. from another basil
   example), you can keep it. Alternatively, change the `@includepath`
   line to where the library actually lives.
2. In InDesign, open the Scripts panel (*Window → Utilities → Scripts*),
   right-click the folder *User* and choose *Reveal in Finder*. Link the
   `Basil Scripts` folder into that directory:
   ```sh
   ln -s "/path/to/Indesign_Basil_Batch_Template/Basil Scripts" "/path/to/revealed/Scripts Panel"
   ```

More on the setup: the official
[getting started guide](https://basiljs2.netlify.app/tutorials/01-getting-started/).
All functions: [basil.js reference](https://basiljs2.netlify.app/reference/).
For code completion and documentation in VS Code, install the extension
from the Marketplace (search `ext:jsx basil`).

## How to Run

The template and the source material:

```
template/
  template.idml    A5 page with a text box and a 5 × 5 cm image box
source/
  glacier/
    text.txt       first line: title; an empty line starts a new paragraph
    01.jpg         images (jpg, png, tif), placed in alphabetical order
    02.jpg
  harbour/
    ...
```

Double-click `batch_template.jsx` in the Scripts panel and choose the
`source` folder. The script finds `template/template.idml` next to it (if
not, it asks for a template), and saves `output/glacier.pdf`,
`output/harbour.pdf` … in a folder `output` next to `source`. Existing
PDFs are overwritten.

### Changing the template

Open `template/template.idml` in InDesign, change the layout and save it
again as IDML (*File → Save a Copy…*, format *InDesign Markup (IDML)*), or
as an InDesign template (`.indt`, then choose it when the script asks).
The script needs:

- a text frame with the script label `text`,
- a graphic frame with the script label `image`,
- the paragraph styles `Title` (first paragraph) and `Body` (the rest).

Script labels are set in *Window → Utilities → Script Label*: select the
frame, type the label, click outside the panel. Size, position, font,
colours and everything else are up to you.

## Coding Help

Scripts are written in ExtendScript (an old dialect of JavaScript). A basil
script defines `draw()` and optionally `setup()`, which runs once before it;
basil calls both automatically once the library is included.

- **`setup()`**: asks for the `source` folder with
  `Folder.selectDialog()` and looks for `template/template.idml` next to
  it; `File.openDialog()` is the fallback.
- **`draw()`**: creates the `output` folder, sets the PDF export to all
  pages and calls `buildDocument()` for every subfolder.
- **`buildDocument()` → template**: `app.open()` opens the IDML as a new,
  untitled document, so the template itself never changes. `doc()` tells
  basil to work with it, `units(PX)` makes `offsetX` / `offsetY` pixel
  values. `labels("text")[0]` and `labels("image")[0]` find the two boxes
  by their script label.
- **`buildDocument()` → text**: `readParagraphs()` reads `text.txt` as
  UTF-8; the paragraphs, joined with `\r` (InDesign's paragraph
  separator), replace the placeholder text. `applyParagraphStyle()`
  formats the whole story with `Body` and the first paragraph with
  `Title` – the look is defined in the template, not in the code. If the
  text is too long for the box, a message appears in the console
  (`println()`).
- **`buildDocument()` → images**: the first image goes into the template
  box. For every further image, `duplicate()` copies the previous box
  (the copy lies on top) and `transform(…, "translate", [offsetX,
  offsetY])` moves it. `place()` puts the image in,
  `FitOptions.FILL_PROPORTIONALLY` fills the square and crops what sticks
  out; use `FitOptions.PROPORTIONALLY` to show the whole image instead.
  Change `offsetX` and `offsetY` at the top of the script for other
  cascades, e.g. `offsetX = 10` to move to the right.
- **`buildDocument()` → export**: `savePDF()` exports with the last used
  PDF settings, `close(false)` closes the document without saving it.
