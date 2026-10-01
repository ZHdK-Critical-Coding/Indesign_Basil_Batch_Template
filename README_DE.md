# Basil.js: Template

[English](README.md)

Ein InDesign-Script, das eine Layoutvorlage mit Inhalt füllt: Für jeden
Ordner in `source/` öffnet es `template/template.idml`, setzt den Text aus
`text.txt` in die Textbox und die Bilder in die Bildbox und exportiert ein
PDF. Jedes weitere Bild bekommt eine Kopie der Box, 10 px nach links und
10 px nach unten verschoben; die Bilder stapeln sich so wie Karten. Die
Gestaltung steckt in der Vorlage – sie wird in InDesign geändert, ohne den
Code anzufassen. Geschrieben mit [basil.js](https://basiljs2.netlify.app),
einer Bibliothek, die die Idee von Processing nach InDesign bringt.

## Installation

Voraussetzungen: Adobe InDesign. Die Bibliothek liegt in `basiljs/`
(basil.js 2.0.0-beta, Build 2025-01-19; basil.js steht unter der
MIT-Lizenz); das Script liegt in
`Basil Scripts/batch_template/batch_template.jsx`.

1. Basil-Scripts laden die Bibliothek mit diesen zwei Zeilen:
   ```js
   // @includepath "~/Documents/;%USERPROFILE%Documents";
   // @include "basiljs/basil.js";
   ```
   InDesign erwartet die Bibliothek deshalb in `~/Documents/basiljs`. Am
   einfachsten geht das mit einem symbolischen Link:
   ```sh
   ln -s "/pfad/zu/Indesign_Basil_Batch_Template/basiljs" ~/Documents
   ```
   Gibt es `~/Documents/basiljs` schon (z. B. von einem anderen
   Basil-Beispiel), kann es bleiben. Alternativ die Zeile `@includepath`
   auf den Ort ändern, an dem die Bibliothek tatsächlich liegt.
2. In InDesign das Scripts-Panel öffnen (*Fenster → Hilfsprogramme →
   Skripte*), mit Rechtsklick auf den Ordner *Benutzer* *Im Finder
   anzeigen* wählen und den Ordner `Basil Scripts` dort hinein verlinken:
   ```sh
   ln -s "/pfad/zu/Indesign_Basil_Batch_Template/Basil Scripts" "/pfad/zum/angezeigten/Scripts Panel"
   ```

Mehr zur Einrichtung: die offizielle
[Getting-Started-Anleitung](https://basiljs2.netlify.app/tutorials/01-getting-started/).
Alle Funktionen: [basil.js-Referenz](https://basiljs2.netlify.app/reference/).
Für Code-Vervollständigung und Dokumentation in VS Code die Erweiterung aus
dem Marketplace installieren (Suche: `ext:jsx basil`).

## Ausführen

Die Vorlage und das Ausgangsmaterial:

```
template/
  template.idml    A5-Seite mit einer Textbox und einer Bildbox von 5 × 5 cm
source/
  glacier/
    text.txt       erste Zeile: Titel; eine Leerzeile beginnt einen neuen Absatz
    01.jpg         Bilder (jpg, png, tif), in alphabetischer Reihenfolge gesetzt
    02.jpg
  harbour/
    ...
```

Im Scripts-Panel auf `batch_template.jsx` doppelklicken und den Ordner
`source` wählen. Das Script findet `template/template.idml` daneben (sonst
fragt es nach einer Vorlage) und speichert `output/glacier.pdf`,
`output/harbour.pdf` … in einem Ordner `output` neben `source`. Bestehende
PDFs werden überschrieben.

### Die Vorlage ändern

`template/template.idml` in InDesign öffnen, das Layout ändern und wieder
als IDML speichern (*Datei → Kopie speichern…*, Format *InDesign Markup
(IDML)*), oder als InDesign-Vorlage (`.indt`, dann diese wählen, wenn das
Script danach fragt). Das Script braucht:

- einen Textrahmen mit dem Skriptetikett `text`,
- einen Grafikrahmen mit dem Skriptetikett `image`,
- die Absatzformate `Title` (erster Absatz) und `Body` (der Rest).

Skriptetiketten setzt man unter *Fenster → Hilfsprogramme →
Skriptetikett*: Rahmen auswählen, Etikett eintippen, ausserhalb des Panels
klicken. Grösse, Position, Schrift, Farben und alles andere sind frei.

## Coding-Hilfe

Die Scripts sind in ExtendScript geschrieben (ein alter
JavaScript-Dialekt). Ein Basil-Script definiert `draw()` und optional
`setup()`, das einmal davor läuft; basil ruft beide automatisch auf, sobald
die Bibliothek eingebunden ist.

- **`setup()`**: fragt mit `Folder.selectDialog()` nach dem Ordner
  `source` und sucht daneben `template/template.idml`;
  `File.openDialog()` ist die Ausweichlösung.
- **`draw()`**: legt den Ordner `output` an, stellt den PDF-Export auf
  alle Seiten und ruft für jeden Unterordner `buildDocument()` auf.
- **`buildDocument()` → Vorlage**: `app.open()` öffnet die IDML als neues,
  unbenanntes Dokument; die Vorlage selbst ändert sich also nie. `doc()`
  sagt basil, mit diesem Dokument zu arbeiten, `units(PX)` macht
  `offsetX` / `offsetY` zu Pixelwerten. `labels("text")[0]` und
  `labels("image")[0]` finden die zwei Boxen über ihr Skriptetikett.
- **`buildDocument()` → Text**: `readParagraphs()` liest `text.txt` als
  UTF-8; die Absätze, verbunden mit `\r` (dem Absatztrenner von InDesign),
  ersetzen den Platzhaltertext. `applyParagraphStyle()` formatiert die
  ganze Textabfolge mit `Body` und den ersten Absatz mit `Title` – das
  Aussehen ist in der Vorlage festgelegt, nicht im Code. Ist der Text zu
  lang für die Box, erscheint eine Meldung in der Konsole (`println()`).
- **`buildDocument()` → Bilder**: Das erste Bild kommt in die Box der
  Vorlage. Für jedes weitere Bild kopiert `duplicate()` die vorherige Box
  (die Kopie liegt obenauf), und `transform(…, "translate", [offsetX,
  offsetY])` verschiebt sie. `place()` setzt das Bild ein,
  `FitOptions.FILL_PROPORTIONALLY` füllt das Quadrat und beschneidet, was
  übersteht; mit `FitOptions.PROPORTIONALLY` ist stattdessen das ganze
  Bild zu sehen. Für andere Kaskaden `offsetX` und `offsetY` oben im
  Script ändern, z. B. `offsetX = 10`, um nach rechts zu versetzen.
- **`buildDocument()` → Export**: `savePDF()` exportiert mit den zuletzt
  verwendeten PDF-Einstellungen, `close(false)` schliesst das Dokument,
  ohne es zu speichern.
