# Basil.js: Template

[Deutsch](README_DE.md)

An InDesign script that fills a layout template with content: the
document that is open in InDesign is the template. For every folder in
`source/` it fills one page – the first folder overwrites page 1, every
further folder gets a new page with the layout of page 1 – and exports the
whole document as one PDF. The text from `text.txt` goes into the text
box, the images into the image box; every further image gets a copy of the
box, moved 10 px to the left and 10 px down, so the images pile up like a
stack of cards. The design lives in the template – change it in InDesign,
without touching the code. Written with
[basil.js](https://basiljs2.netlify.app), a library that brings the spirit
of Processing to InDesign.

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
2. 1. **Open the template first**: open `template/template.idml` in
   InDesign (or your own template). **The script works directly in the
   document that is open and active when you start it** and uses its
   current settings – page size, styles, frames, also changes you have
   just made and not saved.
2. Double-click `batch_template.jsx` in the Scripts panel and choose the
   `source` folder.

The script fills **page 1 with the first folder**, overwriting what was
there, and **adds one page per further folder**, each with the layout of
page 1. It then saves the whole document as one PDF in a folder `output`
next to `source`, named after the document (`output/template.pdf`). The
document stays open – check it, adjust it by hand, save it as `.indd`.

Running the script again in the same document overwrites page 1 again:
the image copies of the previous run on page 1 are removed, and if the
document has more than one page, the script asks whether to remove pages
2 to the end first. To keep the template itself unchanged, open
`template.idml` freshly for every run (IDML always opens as a new,
untitled document), or use *File → Save As* to keep a filled version.

### Changing the template

Any open document can be the template – change `template/template.idml`
and run the script directly, or save your own layout as `.indd`, `.indt`
or IDML (*File → Save a Copy…*, format *InDesign Markup (IDML)*) for
later. Page 1 of the template needs:

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
  template. (If no document is open, basil creates an empty one; it has no
  labelled frames, so the script stops with a message.) `findLabelled()`
  checks that page 1 has both frames, then `Folder.selectDialog()` asks
  for the `source` folder.
- **`draw()` → clean up**: `units(PX)` makes `offsetX` / `offsetY` pixel
  values. Image copies of a previous run on page 1 (label `image-copy`)
  are removed; pages after page 1 are removed with `removePage()` if you
  confirm.
- **`draw()` → pages**: first, `templatePage.duplicate(LocationOptions.AT_END)`
  copies the still empty page 1 once per further folder – so every page
  starts with the same layout. Only then `fillPage()` fills page by page.
- **`fillPage()` → text**: `findLabelled()` looks for the frames with the
  script labels `text` and `image` on this page. `readParagraphs()` reads
  `text.txt` as UTF-8; the paragraphs, joined with `\r` (InDesign's
  paragraph separator), replace the placeholder text.
  `applyParagraphStyle()` formats the story with `Body` and the first
  paragraph with `Title` – the look is defined in the template, not in the
  code. If the text is too long for the box, a message appears in the
  console (`println()`).
- **`fillPage()` → images**: the first image goes into the template box.
  For every further image, `duplicate()` copies the previous box onto the
  current page – set with `page(pg)` – and `transform(…, "translate",
  [offsetX, offsetY])` moves it. The copy gets the label `image-copy`, so
  only the original counts as `image`. `place()` puts the image in,
  `FitOptions.FILL_PROPORTIONALLY` fills the square and crops what sticks
  out; use `FitOptions.PROPORTIONALLY` to show the whole image instead.
  Change `offsetX` and `offsetY` at the top of the script for other
  cascades, e.g. `offsetX = 10` to move to the right.
- **Export**: `savePDF()` exports all pages with the last used PDF
  settings. The document is not closed. For one PDF per folder instead,
  set `app.pdfExportPreferences.pageRange` to the page number (e.g.
  `"2"`) and call `savePDF()` inside the loop.
