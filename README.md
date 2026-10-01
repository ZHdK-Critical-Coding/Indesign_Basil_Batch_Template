# Basil.js: Template

[Deutsch](README_DE.md)

An InDesign script that fills a layout template with content: the
document that is open in InDesign is the template. For every folder in
`source/` the script makes a copy of it, puts the text from `text.txt` into
the text box and the images into the image box, and exports a PDF. The
copies stay open, the template stays unchanged. Every further image gets a copy of the box, moved 10 px to
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

1. **Open the template first**: open `template/template.idml` in
   InDesign (or your own template). **The script uses the document that is
   open and active when you start it as the template.**
2. Double-click `batch_template.jsx` in the Scripts panel and choose the
   `source` folder.

For every folder the script creates a new, untitled document from the
template, fills it and saves `output/glacier.pdf`, `output/harbour.pdf` …
in a folder `output` next to `source`. Existing PDFs are overwritten.

**The documents are not closed**: after the run, one document per folder
is open, so you can check the layout, adjust it by hand, save it as
`.indd` or export it again. The template itself is not changed. With many
folders, many documents open at once – close them with *File → Close All*
(Cmd/Ctrl+Alt+Shift+W) and choose *Don't Save*.

### Changing the template

Any open document can be the template – change `template/template.idml`
and run the script directly, or save your own layout as `.indd`, `.indt`
or IDML (*File → Save a Copy…*, format *InDesign Markup (IDML)*) for
later. The template needs:

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

- **`setup()`**: `doc()` returns the active document – this is the
  template. (If no document is open, basil creates an empty one; it has
  no labelled frames, so the script stops with a message.) `hasLabel()`
  checks that both frames exist, then `Folder.selectDialog()` asks for
  the `source` folder.
- **`draw()`**: creates the `output` folder, sets the PDF export to all
  pages and saves a snapshot of the template with `saveACopy()` into the
  temporary folder. Then it calls `buildDocument()` for every subfolder
  and deletes the snapshot at the end.
- **`buildDocument()` → copy**: `app.open(…, true,
  OpenOptions.OPEN_COPY)` opens the snapshot as a new, untitled document,
  so the template never changes. `doc()` tells basil to work with it,
  `units(PX)` makes `offsetX` / `offsetY` pixel values. `labels("text")[0]`
  and `labels("image")[0]` find the two boxes by their script label.
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
  PDF settings. The document stays open; to close it automatically (e.g.
  for hundreds of folders), add `close(false);` after `savePDF()` – it
  closes without saving.
