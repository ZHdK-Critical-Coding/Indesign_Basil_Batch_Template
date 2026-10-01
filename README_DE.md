# Basil.js: Template

[English](README.md)

Ein InDesign-Script, das eine Layoutvorlage mit Inhalt füllt: Das in
InDesign geöffnete Dokument ist die Vorlage. Für jeden Ordner in `source/`
füllt es eine Seite – der erste Ordner überschreibt Seite 1, jeder weitere
bekommt eine neue Seite mit dem Layout von Seite 1 – und exportiert das
ganze Dokument als ein PDF. Die Vorlage hat drei Boxen: Die erste Zeile
von `text.txt` kommt in die Titelbox, der Rest in die Textbox, die Bilder
in die Bildbox; jedes weitere Bild bekommt eine Kopie der Bildbox,
10 px nach links und 10 px nach unten verschoben, sodass sich die Bilder
wie Karten stapeln. Die Gestaltung steckt in der Vorlage – sie wird in
InDesign geändert, ohne den Code anzufassen. Geschrieben mit
[basil.js](https://basiljs2.netlify.app), einer Bibliothek, die die Idee von
Processing nach InDesign bringt.

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
  template.idml    A5-Seite mit Titelbox, Textbox und einer Bildbox von 5 × 5 cm
source/
  glacier/
    text.txt       erste Zeile: Titel; eine Leerzeile beginnt einen neuen Absatz
    01.jpg         Bilder (jpg, png, tif), in alphabetischer Reihenfolge gesetzt
    02.jpg
  harbour/
    ...
```

1. **Zuerst die Vorlage öffnen**: `template/template.idml` (oder eine
   eigene Vorlage) in InDesign öffnen. **Das Script verwendet das Dokument
   als Vorlage, das beim Start geöffnet und aktiv ist.**
2. 1. **Zuerst die Vorlage öffnen**: `template/template.idml` (oder eine
   eigene Vorlage) in InDesign öffnen. **Das Script arbeitet direkt im
   Dokument, das beim Start geöffnet und aktiv ist**, und übernimmt
   dessen aktuelle Einstellungen – Seitenformat, Formate, Rahmen, auch
   eben gemachte, nicht gespeicherte Änderungen.
2. Im Scripts-Panel auf `batch_template.jsx` doppelklicken und den Ordner
   `source` wählen.

Das Script füllt **Seite 1 mit dem ersten Ordner** und überschreibt, was
dort war, und **fügt für jeden weiteren Ordner eine Seite hinzu**, jeweils
mit dem Layout von Seite 1. Danach speichert es das ganze Dokument als ein
PDF in einem Ordner `output` neben `source`, benannt nach dem Dokument
(`output/template.pdf`). Das Dokument bleibt offen – prüfen, von Hand
anpassen, als `.indd` speichern.

Ein weiterer Durchlauf im selben Dokument überschreibt Seite 1 erneut: Die
Bildkopien des letzten Durchlaufs auf Seite 1 werden entfernt, und hat das
Dokument mehr als eine Seite, fragt das Script, ob die Seiten 2 bis Ende
zuerst entfernt werden sollen. Um die Vorlage unverändert zu behalten,
`template.idml` für jeden Durchlauf neu öffnen (IDML öffnet sich immer als
neues, unbenanntes Dokument) oder eine gefüllte Version mit *Datei →
Speichern unter* sichern.

### Die Vorlage ändern

Jedes geöffnete Dokument kann die Vorlage sein – `template/template.idml`
ändern und das Script direkt ausführen, oder das eigene Layout für später
als `.indd`, `.indt` oder IDML speichern (*Datei → Kopie speichern…*,
Format *InDesign Markup (IDML)*). Seite 1 der Vorlage braucht:

- einen Textrahmen mit dem Skriptetikett `title` – für die erste Zeile
  von `text.txt`,
- einen Textrahmen mit dem Skriptetikett `text` – für den Rest,
- einen Grafikrahmen mit dem Skriptetikett `image` – für die Bilder.

Grösse, Position, Farben und alles andere sind frei.

#### Ein Skriptetikett setzen

1. Das Panel *Fenster → Hilfsprogramme → Skriptetikett* öffnen.
2. Den Rahmen mit dem **Auswahlwerkzeug** (schwarzer Pfeil, V) auswählen
   – nicht mit dem Textwerkzeug.
3. Das Etikett ins Panel tippen: `title`, `text` oder `image`, klein
   geschrieben, ohne Leerzeichen oder Zeilenumbruch.
4. **Auf eine leere Stelle der Seite klicken.** Das Etikett wird erst
   gespeichert, wenn das Panel den Fokus verliert; wer direkt einen
   anderen Rahmen anklickt, gibt das Etikett unter Umständen diesem.
5. Zur Kontrolle den Rahmen nochmals auswählen – das Panel zeigt sein
   Etikett.

Der Name eines Rahmens im Panel *Ebenen* ist nicht sein Skriptetikett;
ihn dort umzubenennen, hat keine Wirkung auf das Script. Die Rahmen in
`template.idml` haben ihre Etiketten schon.

**Der Platzhaltertext bestimmt das Aussehen des Textes**: Den Text in den
Boxen `title` und `text` so formatieren, wie das Ergebnis aussehen soll –
mit Absatzformaten oder direkt (Schrift, Grösse, Farbe …); der neue Text
übernimmt genau diese Formatierung. Alle Absätze in der Textbox sehen aus
wie ihr erster Platzhalterabsatz.

## Coding-Hilfe

Die Scripts sind in ExtendScript geschrieben (ein alter
JavaScript-Dialekt). Ein Basil-Script definiert `draw()` und optional
`setup()`, das einmal davor läuft; basil ruft beide automatisch auf, sobald
die Bibliothek eingebunden ist.

- **`setup()`**: `doc()` gibt das aktive Dokument zurück – das ist die
  Vorlage. (Ist kein Dokument offen, legt basil ein leeres an; es hat
  keine etikettierten Rahmen, also bricht das Script mit einer Meldung
  ab.) `findLabelled()` prüft, ob Seite 1 alle drei Rahmen hat, danach fragt
  `Folder.selectDialog()` nach dem Ordner `source`.
- **`draw()` → Aufräumen**: `units(PX)` macht `offsetX` / `offsetY` zu
  Pixelwerten. Bildkopien eines früheren Durchlaufs auf Seite 1 (Etikett
  `image-copy`) werden entfernt; Seiten nach Seite 1 entfernt
  `removePage()`, wenn man bestätigt.
- **`draw()` → Seiten**: Zuerst kopiert
  `templatePage.duplicate(LocationOptions.AT_END)` die noch leere Seite 1
  einmal pro weiterem Ordner – so beginnt jede Seite mit demselben Layout.
  Erst dann füllt `fillPage()` Seite für Seite.
- **`fillPage()` → Text**: `findLabelled()` sucht auf dieser Seite die
  Rahmen mit den Skriptetiketten `title`, `text` und `image`.
  `readParagraphs()` liest `text.txt` als UTF-8. Der erste Absatz kommt
  in die Titelbox, die übrigen – verbunden mit `\r` (dem Absatztrenner
  von InDesign) – in die Textbox.
- **`replaceText()`**: ersetzt den ganzen Text eines Rahmens
  (`story.texts[0].contents`). Ersetzter Text übernimmt die Formatierung
  des Textes, den er ersetzt – das Aussehen ist also in der Vorlage
  festgelegt, nicht im Code.
  (Absatzformate aus dem Script zuzuweisen, z. B. mit
  `applyParagraphStyle()`, würde direkt in der Vorlage gesetzte
  Formatierung zurücksetzen.) Ist der Text zu lang für die Box, erscheint
  eine Meldung in der Konsole (`println()`).
- **`fillPage()` → Bilder**: Das erste Bild kommt in die Box der Vorlage.
  Für jedes weitere Bild kopiert `duplicate()` die vorherige Box auf die
  aktuelle Seite – gesetzt mit `page(pg)` –, und `transform(…,
  "translate", [offsetX, offsetY])` verschiebt sie. Die Kopie bekommt das
  Etikett `image-copy`, damit nur das Original als `image` zählt.
  `place()` setzt das Bild ein, `FitOptions.FILL_PROPORTIONALLY` füllt das
  Quadrat und beschneidet, was übersteht; mit `FitOptions.PROPORTIONALLY`
  ist stattdessen das ganze Bild zu sehen. Für andere Kaskaden `offsetX`
  und `offsetY` oben im Script ändern, z. B. `offsetX = 10`, um nach
  rechts zu versetzen.
- **Export**: `savePDF()` exportiert alle Seiten mit den zuletzt
  verwendeten PDF-Einstellungen. Das Dokument wird nicht geschlossen. Für
  ein PDF pro Ordner stattdessen `app.pdfExportPreferences.pageRange` auf
  die Seitenzahl setzen (z. B. `"2"`) und `savePDF()` in der Schleife
  aufrufen.
