[deutsche Übersetzung unten](#foto-raster-drucker)
# photo-raster-printer
a free browser utility for creating photo rasters to print directly or save as pdf

## how it works
- no download required
- your browser does all the work (using javascript):
  * no files are uploaded
  * no need to download result

## usage
You probably don't need this - just [try it out](http://photoraster.org), it's easy!

Drag & drop photos (jpg or png) from your file explorer onto the orange boxes to insert them. The photos will be scaled to fit the box. After scaling, the photo will fill up the entire box and either width or height of your photo will fit exactly, while the other one will be clipped.

To move an photo around in its box just drag & drop it.

All measures are in millimeters (1 in = 25.4 mm).

The page width and height should be set according to the paper size you want to print the result in. Initial size is A4 (210mm x 297mm). See Wikipedia for common [international](https://en.wikipedia.org/wiki/Paper_size#Overview:_ISO_paper_sizes) and [American](https://en.wikipedia.org/wiki/Paper_size#Standardized_American_paper_sizes) paper sizes.

Each printer can a only print to a specific area of a paper, leaving a margin along the edges. Setting the printer margin reduces the effective paper size, so your printer does not have to clip or scale anything. In print preview mode you can see if your browser is scaling nevertheless, in that case make sure to disable auto-scaling (set to 100%).

Adjust the number of rows and columns by clicking the plus or minus buttons in the lower right corner.

## printing
Use your browsers print option to save as pdf or print on paper. To save as pdf select a pdf-printer instead of an actual printer. On some operating systems (like windows 8 and older) you might need to install a pdf-printer first.

## license
Apache 2.0
Pascal Führlich 2017

# Foto-Raster-Drucker
Ein kostenloses Browser-Werkzeug zur Erstellung von Foto-Rastern zum direkt Ausdrucken oder um sie als pdf zu speichern.

## Wie es funktioniert
- kein Download nötig
- dein Browser erledigt alles lokal auf deinem Computer (mit Hilfe von JavaScript):
  * deine Bilder werden _nicht_ hochgeladen
  * das Ergebnis muss nicht heruntergeladen werden

## Anleitung
Ziehe Fotos (im jpg oder png Format) per drag & drop von deinem Desktop oder Datei-Explorer direkt auf das gewünschte orangene Feld um sie dort einzufügen. Die Bilder werden automatisch so verkleinert oder vergrößert, dass sie das gesamte Feld ausfüllen.

Um ein Bild in seinem Feld zu bewegen ziehe es per drag & drop an die gewünschte Position.

Alle Maße werden in Millimeter angegeben.

Die Höhe und Breite der Seite sollten auf die Druck-Papier-Größe gesetzt werden. A4 ist voreingestellt, andere übliche Formate sind auf [Wikipedia](https://de.wikipedia.org/wiki/Papierformat) zu finden.

Jeder Drucker hat einen bestimmten Druckrand, also einen Streifen an den Rändern des Papiers den er nicht bedrucken kann. Je nach Drucker sollte der voreingestellte Wert von 20mm also verändert werden, sodass das Ergebnis ohne Vergrößerung oder Verkleinerung gedruckt werden kann.

Die Anzahl der Zeilen und Spalten kann mit den Plus- und Minus-Buttons unten rechts angepasst werden.

## Drucken und Speichern
Zum Drucken und Speichern wird die Druckfuntion des Browsers verwendet. Stelle vor dem Drucken mit der Druckvorschau sicher, dass alles richtig aussieht. Eventuell sollte die automatische Vergrößerung/Verkleinerung/Skalierung deaktiviert, also auf 100% gesetzt, werden.
Um das Ergebnis auszudrucken wähle den gewünschten Drucker aus.
Um das Ergebnis als pdf zu speichern wähle einen pdf Drucker aus. Auf manchen Betriebssystemen, zum Beispiel Windows XP, 7 und 8, muss zunächst ein pdf-Drucker installiert werden.

## Lizenz
Apache 2.0
Pascal Führlich 2017
