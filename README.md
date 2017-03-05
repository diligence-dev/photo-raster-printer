# image-grid-printer
a free browser utility for creating image grids to print directly or save as pdf

## how it works
- no download required
- your browser does all the work:
  * no files are uploaded
  * no need to download result

## detailed instructions
You probably don't need this - just [try it out](https://paxinice.github.io/image-grid-printer/), it's easy!


Start by selecting how many rows and columns you want, if you change this later **all your images will be reset**!

All measures are in millimeters (1 in = 25.4 mm).

The margin between images specifies how much whitespace divides the images, effectively making them smaller.

The page width and height should be set according to the size you want to print the result in. Initial size is A4 (210mm x 297mm). See Wikipedia for common [international](https://en.wikipedia.org/wiki/Paper_size#Overview:_ISO_paper_sizes) and [American](https://en.wikipedia.org/wiki/Paper_size#Standardized_American_paper_sizes) paper sizes.

Each printer can a only print to a specific area of a paper, leaving a margin along the edges. Setting the printer margin reduces the effective paper size, so your printer does not clip or scale anything.

Drag and drop image files (jpg or png) onto the orange boxes to insert them. The images will be scaled to fit the box. After scaling, the image will fill up the entire box and either width or height of your image will fit exactly, while the other one will be clipped.

Finally click the print button to save as pdf or print on paper. To save as pdf select a pdf-printer instead of an actual printer. On some operating systems (like windows 8 and older) you might need to install a pdf-printer first.

## upcoming
- keep images when changing number of columns/rows
- move image in it's box
- better looking settings
- translations
- menu bar

## created with
- [jquery](https://jquery.org/)
- [atom](https://atom.io/)

## license
Apache 2.0

Pascal Führlich 2017
