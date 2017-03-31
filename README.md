# photo-raster-printer
a free browser utility for creating photo rasters to print directly or save as pdf

## how it works
- no download required
- your browser does all the work (using javascript):
  * no files are uploaded
  * no need to download result

## usage
You probably don't need this - just [try it out](https://paxinice.github.io/photo-raster-printer/), it's easy!

Adjust the number of rows and columns by clicking the plus or minus buttons in the lower right corner.

All measures are in millimeters (1 in = 25.4 mm).

The page width and height should be set according to the size you want to print the result in. Initial size is A4 (210mm x 297mm). See Wikipedia for common [international](https://en.wikipedia.org/wiki/Paper_size#Overview:_ISO_paper_sizes) and [American](https://en.wikipedia.org/wiki/Paper_size#Standardized_American_paper_sizes) paper sizes.

Each printer can a only print to a specific area of a paper, leaving a margin along the edges. Setting the printer margin reduces the effective paper size, so your printer does not have to clip or scale anything. In print preview mode you can see if your browser is scaling nevertheless, in that case make sure to disable auto-scaling (set to 100%).

Drag and drop image files (jpg or png) onto the orange boxes to insert them. The images will be scaled to fit the box. After scaling, the image will fill up the entire box and either width or height of your image will fit exactly, while the other one will be clipped.

To move an image around in its box just drag and drop it.

Finally use your browsers print option to save as pdf or print on paper. To save as pdf select a pdf-printer instead of an actual printer. On some operating systems (like windows 8 and older) you might need to install a pdf-printer first.

## license
Apache 2.0

Pascal Führlich 2017
