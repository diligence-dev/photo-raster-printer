const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAA1JREFUCJlj+D/T+D8ABzECy352aNAAAAAASUVORK5CYII='

const sideDivWidth = 140 //px
const sideDivHeight = 70 //px
const sideDivMargin = 10 //px

function stopProp(e) {
	e.stopPropagation()
	e.preventDefault()
}

function scaleImage() {
	var widthScale = $(this).parent().width() / $(this).prop('naturalWidth')
	var heightScale = $(this).parent().height() / $(this).prop('naturalHeight')

	if (widthScale > heightScale) {
		$(this)
			.width(widthScale * $(this).prop('naturalWidth'))
			.height(widthScale * $(this).prop('naturalHeight'))
			.css('top', -0.5 * ($(this).height() - $(this).parent().height()))
	} else {
		$(this)
			.width(heightScale * $(this).prop('naturalWidth'))
			.height(heightScale * $(this).prop('naturalHeight'))
			.css('left', -0.5 * ($(this).width() - $(this).parent().width()))
	}
}

$('#topDiv')
	.height(sideDivHeight)
	.width('100%')
	.css('top', -sideDivHeight - sideDivMargin)
	.on('mlayout', stopProp)
$('#leftDiv')
	.width(sideDivWidth)
	.height('100%')
	.css('left', -sideDivWidth - sideDivMargin)
	.on('mlayout', stopProp)

$('#rightDiv')
	.width(sideDivWidth)
	.height('100%')
	.css('right', -sideDivWidth - sideDivMargin)
	.on('mlayout', stopProp)
$('#bottomDiv')
	.height(sideDivHeight)
	.width('100%')
	.css('bottom', -sideDivHeight - sideDivMargin)
	.on('mlayout', stopProp)

var paperWidth = 210 //mm
var paperHeight = 297 //mm

var printerMargin = 10 //mm
var imageMargin = 5 //mm

var columns = 3 //mm
var rows = 4 //mm

var imageWidth
var imageHeight

var blobs = {}


$(window).on('resize', function(){
	//center paper in body
	let mleft = 0.5 * ($(window).width() - $('#paper').width())
	$('#paper').css('left', Math.max(sideDivWidth + sideDivMargin, mleft))
	let mtop = 0.5 * ($(window).height() - $('#paper').height())
	$('#paper').css('top', Math.max(sideDivHeight + sideDivMargin, mtop))
})

$('#paper').on('mlayout', function(e){stopProp(e)
	$(this)
		.width(paperWidth + 'mm')
		.height(paperHeight + 'mm')
		.children().trigger('mlayout')
})

$('#printArea').on('mlayout', function(e){stopProp(e)
	var printWidth = paperWidth - 2 * printerMargin
	var printHeight = paperHeight - 2 * printerMargin
	imageWidth = (printWidth - (columns - 1) * imageMargin) / columns
	imageHeight = (printHeight - (rows - 1) * imageMargin) / rows
	$(this)
		.css('left', printerMargin + 'mm')
		.css('top', printerMargin + 'mm')
		.width(printWidth + 'mm')
		.height(printHeight + 'mm')
		.children().trigger('mlayout')
})

function boxLayoutFunction(mcol, mrow){
	return function(e){stopProp(e)
		$(this)
			.width(imageWidth + 'mm')
			.height(imageHeight + 'mm')
			.css('top', mrow * (imageMargin + imageHeight) + 'mm')
			.css('left', mcol * (imageMargin + imageWidth) + 'mm')
			.find('img').trigger('load')
	}
}

function boxDropFunction(mcol, mrow) {
	//saving x as lx, otherwise x == columns onDrop for each box
	return function(e) {stopProp(e)
		if (e.originalEvent.dataTransfer.files.length > 0) {
			var mURL = window.URL.createObjectURL(e.originalEvent.dataTransfer.files[0])
			blobs[[mcol, mrow]] = mURL
			$(this).find('img')
				.attr('src', mURL)
				.trigger('load')
		}
		$(this).trigger('dragleave')
	}
}

function boxDragEnter(e) {stopProp(e)
	$(this)
		.css('box-shadow', '0 0 0 20px green')
		.css('z-index', '1')
}

function boxDragLeave(e) {stopProp(e)
	$(this)
		.css('box-shadow', 'initial')
		.css('z-index', 'initial')
}

for (var col = 0; col < columns; col++) {
	for (var row = 0; row < rows; row++) {
		$('<div class="box"><img></div>')
			.appendTo($('#printArea'))
			.on('mlayout', boxLayoutFunction(col, row))
			.on('dragenter', boxDragEnter)
			.on('dragover', stopProp)
			.on('dragleave', boxDragLeave)
			.on('drop', boxDropFunction(col, row))
			.find('img')
				.attr('src', blobs[[col, row]] || placeholder)
				.on('load', scaleImage)
	}
}


$(document).ready(function(){
	$('#paper').trigger('mlayout')
	$(window).trigger('resize')
})
