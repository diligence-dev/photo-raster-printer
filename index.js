const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAA1JREFUCJlj+D/T+D8ABzECy352aNAAAAAASUVORK5CYII='

const sideDivWidth = 140 //px
const sideDivHeight = 70 //px
const sideDivMargin = 10 //px

function stopProp(e) {
	e.stopPropagation()
	e.preventDefault()
}

function addMeasure(divSelector, layoutFunc) {
	$('<div class="measure screenAbsolute"><svg><g stroke-width="2px" stroke="black"><line/><line/><line/></g></svg></div>')
		.appendTo(divSelector)
		.on('mlayout', function(e){stopProp(e)
			$.proxy(layoutFunc, $(this))()
		})
}

$('#topDiv')
	.height(sideDivHeight)
	.width('100%')
	.css('top', -sideDivHeight - sideDivMargin)
	.on('mlayout', function(e){stopProp(e)
		$(this).children().trigger('mlayout')
	})
$('#leftDiv')
	.width(sideDivWidth)
	.height('100%')
	.css('left', -sideDivWidth - sideDivMargin)
	.on('mlayout', function(e){stopProp(e)
		$(this).children().trigger('mlayout')
	})

$('#rightDiv')
	.width(sideDivWidth)
	.height('100%')
	.css('right', -sideDivWidth - sideDivMargin)
	.on('mlayout', function(e){stopProp(e)
		$(this).children().trigger('mlayout')
	})
$('#bottomDiv')
	.height(sideDivHeight)
	.width('100%')
	.css('bottom', -sideDivHeight - sideDivMargin)
	.on('mlayout', function(e){stopProp(e)
		$(this).children().trigger('mlayout')
	})

var paperWidth = 210 //mm
var paperHeight = 297 //mm

var printerMargin = 10 //mm
var imageMargin = 5 //mm

var columns = 3 //mm
var rows = 4 //mm

var imageWidth //mm
var imageHeight //mm

var blobs = {}

function setHorizontalLines(lines, mwidth) {
	lines[0].setAttribute('x1', 5)
	lines[0].setAttribute('x2', mwidth - 5)
	lines[0].setAttribute('y1', '50%')
	lines[0].setAttribute('y2', '50%')

	lines[1].setAttribute('x1', 5)
	lines[1].setAttribute('x2', 5)
	lines[1].setAttribute('y1', '0%')
	lines[1].setAttribute('y2', '100%')

	lines[2].setAttribute('x1', mwidth - 5)
	lines[2].setAttribute('x2', mwidth - 5)
	lines[2].setAttribute('y1', '0%')
	lines[2].setAttribute('y2', '100%')
}
function setVerticalLines(lines, mheight) {
	lines[0].setAttribute('y1', 5)
	lines[0].setAttribute('y2', mheight - 5)
	lines[0].setAttribute('x1', '50%')
	lines[0].setAttribute('x2', '50%')

	lines[1].setAttribute('y1', 5)
	lines[1].setAttribute('y2', 5)
	lines[1].setAttribute('x1', '0%')
	lines[1].setAttribute('x2', '100%')

	lines[2].setAttribute('y1', mheight - 5)
	lines[2].setAttribute('y2', mheight - 5)
	lines[2].setAttribute('x1', '0%')
	lines[2].setAttribute('x2', '100%')
}

addMeasure('#topDiv', function(){
	$(this)
		.css('left', 0)
		.width(printerMargin + 'mm')
	setHorizontalLines($(this).find('line'), $(this).width())
})
addMeasure('#topDiv', function(){
	$(this)
		.css('right', 0)
		.width(printerMargin + 'mm')
	setHorizontalLines($(this).find('line'), $(this).width())
})

addMeasure('#leftDiv', function(){
	$(this)
		.css('top', 0)
		.height(printerMargin + 'mm')
	setVerticalLines($(this).find('line'), $(this).height())
})
addMeasure('#leftDiv', function(){
	$(this)
		.css('bottom', 0)
		.height(printerMargin + 'mm')
	setVerticalLines($(this).find('line'), $(this).height())
})

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
	$('#printArea').trigger('mlayout')
})

$('#printArea').on('mlayout', function(e){stopProp(e)
	var printWidth = paperWidth - 2 * printerMargin
	var printHeight = paperHeight - 2 * printerMargin
	$(this)
		.css('left', printerMargin + 'mm')
		.css('top', printerMargin + 'mm')
		.width(printWidth + 'mm')
		.height(printHeight + 'mm')
	layoutBoxMeasure()
})

function layoutBoxMeasure() {
	var printWidth = paperWidth - 2 * printerMargin
	var printHeight = paperHeight - 2 * printerMargin
	imageWidth = (printWidth - (columns - 1) * imageMargin) / columns
	imageHeight = (printHeight - (rows - 1) * imageMargin) / rows
	$('.box, .measure').trigger('mlayout')
}

function boxLayoutFunction(mcol, mrow){
	return function(e){stopProp(e)
		if(mcol >= columns || mrow >= rows){
			$(this).remove()
		}else{
			$(this)
				.width(imageWidth + 'mm')
				.height(imageHeight + 'mm')
				.css('top', mrow * (imageMargin + imageHeight) + 'mm')
				.css('left', mcol * (imageMargin + imageWidth) + 'mm')
				.find('img').trigger('load')
		}
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

for (var col = 0; col < columns; col++) {
	if(col > 0){
		addMeasure('#topDiv', (function(mcol){
			return function(){
				if(mcol >= columns){
					$(this).remove()
				}else{
					$(this)
						.css('left', printerMargin + mcol * (imageWidth + imageMargin) - imageMargin + 'mm')
						.width(imageMargin + 'mm')
					setHorizontalLines($(this).find('line'), $(this).width())
				}
			}
		})(col))
	}
	addMeasure('#topDiv', (function(mcol){
		return function(){
			if(mcol >= columns){
				$(this).remove()
			}else{
				$(this)
					.css('left', printerMargin + mcol * (imageWidth + imageMargin) + 'mm')
					.width(imageWidth + 'mm')
				setHorizontalLines($(this).find('line'), $(this).width())
			}
		}
	})(col))
}

for (var row = 0; row < rows; row++) {
	if(row > 0){
		addMeasure('#leftDiv', (function(mrow){
			return function(){
				if(mrow >= rows){
					$(this).remove()
				}else{
					$(this)
						.css('top', printerMargin + mrow * (imageHeight + imageMargin) - imageMargin + 'mm')
						.height(imageMargin + 'mm')
					setVerticalLines($(this).find('line'), $(this).height())
				}
			}
		})(row))
	}
	addMeasure('#leftDiv', (function(mrow){
		return function(){
			if(mrow >= rows){
				$(this).remove()
			}else{
				$(this)
					.css('top', printerMargin + mrow * (imageHeight + imageMargin) + 'mm')
					.height(imageHeight + 'mm')
				setVerticalLines($(this).find('line'), $(this).height())
			}
		}
	})(row))
}

function mclick() {
	rows += -1
	layoutBoxMeasure()
}


$(document).ready(function(){
	$('#paper').trigger('mlayout')
	$(window).trigger('resize')
})
