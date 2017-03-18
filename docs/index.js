const $ = require('jquery')
const g = require('./mvarstore.js')()

const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAA1JREFUCJlj+D/T+D8ABzECy352aNAAAAAASUVORK5CYII='
const sideDivWidth = 80 //px
const sideDivHeight = 50 //px
const sideDivMargin = 10 //px

function stopProp(e) {
	e.stopPropagation()
	e.preventDefault()
}

function addMeasure(targetSelector, inputClass, inputValue, layoutFunc, inputFunc) {
	const inp = $('<input class="' + inputClass + '" type="number">')
		.change(function(){
			$.proxy(inputFunc, $(this))()
		})

	$('<div class="measure screenAbsolute"><svg><g stroke-width="2px" stroke="black"><line/><line/><line/></g></svg></div>')
		.append(inp)
		.on('mlayout', function(e){stopProp(e)
			//execute bound to this
			$.proxy(layoutFunc, $(this))()
		})
		.appendTo(targetSelector)
}

$('#topDiv')
	.height(sideDivHeight)
	.width('100%')
	.css('top', -sideDivHeight - sideDivMargin)
$('#leftDiv')
	.width(sideDivWidth)
	.height('100%')
	.css('left', -sideDivWidth - sideDivMargin)

$('#rightDiv')
	.width(sideDivWidth)
	.height('100%')
	.css('right', -sideDivWidth - sideDivMargin)
$('#bottomDiv')
	.height(sideDivHeight)
	.width('100%')
	.css('bottom', -sideDivHeight - sideDivMargin)

const blobs = {}

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
	//saving col as mcol, otherwise col == g.columns() onDrop for each box
	return function(e) {stopProp(e)
		if (e.originalEvent.dataTransfer.files.length > 0) {
			const mURL = window.URL.createObjectURL(e.originalEvent.dataTransfer.files[0])
			blobs[[mcol, mrow]] = mURL
			$(this).find('img')
				.attr('src', mURL)
				.trigger('load')
		}
		$(this).trigger('dragleave')
	}
}

function scaleImage() {
	const widthScale = $(this).parent().width() / $(this).prop('naturalWidth')
	const heightScale = $(this).parent().height() / $(this).prop('naturalHeight')

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

function setHorizontalLines(lines, mwidth) {
	lines[0].setAttribute('x1', 5)
	lines[0].setAttribute('x2', mwidth - 5)
	lines[0].setAttribute('y1', '60%')
	lines[0].setAttribute('y2', '60%')

	lines[1].setAttribute('x1', 5)
	lines[1].setAttribute('x2', 5)
	lines[1].setAttribute('y1', '20%')
	lines[1].setAttribute('y2', '100%')

	lines[2].setAttribute('x1', mwidth - 5)
	lines[2].setAttribute('x2', mwidth - 5)
	lines[2].setAttribute('y1', '20%')
	lines[2].setAttribute('y2', '100%')
}
function setVerticalLines(lines, mheight) {
	lines[0].setAttribute('y1', 5)
	lines[0].setAttribute('y2', mheight - 5)
	lines[0].setAttribute('x1', '60%')
	lines[0].setAttribute('x2', '60%')

	lines[1].setAttribute('y1', 5)
	lines[1].setAttribute('y2', 5)
	lines[1].setAttribute('x1', '20%')
	lines[1].setAttribute('x2', '100%')

	lines[2].setAttribute('y1', mheight - 5)
	lines[2].setAttribute('y2', mheight - 5)
	lines[2].setAttribute('x1', '20%')
	lines[2].setAttribute('x2', '100%')
}

function boxLayoutFunction(mcol, mrow){
	return function(e){stopProp(e)
		if(mcol >= g.columns() || mrow >= g.rows()){
			$(this).remove()
		}else{
			$(this)
				.width(g.imageWidth() + 'mm')
				.height(g.imageHeight() + 'mm')
				.css('top', mrow * (g.imageMargin() + g.imageHeight()) + 'mm')
				.css('left', mcol * (g.imageMargin() + g.imageWidth()) + 'mm')
				.find('img').trigger('load')
		}
	}
}

g.on_paperWidth_changed( () => { $('#paper').trigger('mlayout') })
g.on_paperHeight_changed( () => { $('#paper').trigger('mlayout') })

g.on_printerMargin_changed( () => { $('#printArea').trigger('mlayout') })
// g.on_imageMargin_changed( () => { $('.box, .measure').trigger('mlayout') })
//
// g.on_columns_changed( () => { $('.box, .measure').trigger('mlayout') })
// g.on_rows_changed( () => { $('.box, .measure').trigger('mlayout') })

g.preColumnsChange(function(prevColumns, currColumns){
	for (let col = prevColumns; col < currColumns; col++) {
		for (let row = 0; row < g.rows(); row++) {
			//new image box
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

		//new margin measure
		if(col > 0){
			addMeasure('#topDiv', 'imageMarginInp', g.imageMargin(), (function(mcol){
				return function(){
					if(mcol >= g.columns()){
						$(this).remove()
					}else{
						$(this)
							.css('left', g.printerMargin() + mcol * (g.imageWidth() + g.imageMargin()) - g.imageMargin() + 'mm')
							.width(g.imageMargin() + 'mm')
						setHorizontalLines($(this).find('line'), $(this).width())
					}
				}
			})(col))
		}
		//new image box measure
		addMeasure('#topDiv', 'imageWidthInp', g.imageWidth(), (function(mcol){
			return function(){
				if(mcol >= g.columns()){
					$(this).remove()
				}else{
					$(this)
						.css('left', g.printerMargin() + mcol * (g.imageWidth() + g.imageMargin()) + 'mm')
						.width(g.imageWidth() + 'mm')
					setHorizontalLines($(this).find('line'), $(this).width())
				}
			}
		})(col))
	}
})

g.preRowsChange(function(prevRows, currRows){
	for (let row = prevRows; row < currRows; row++) {
		for (let col = 0; col < g.columns(); col++) {
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

		if(row > 0){
			addMeasure('#leftDiv', 'imageMarginInp', g.imageMargin(), (function(mrow){
				return function(){
					if(mrow >= g.rows()){
						$(this).remove()
					}else{
						$(this)
							.css('top', g.printerMargin() + mrow * (g.imageHeight() + g.imageMargin()) - g.imageMargin() + 'mm')
							.height(g.imageMargin() + 'mm')
						setVerticalLines($(this).find('line'), $(this).height())
					}
				}
			})(row))
		}
		addMeasure('#leftDiv', 'imageHeightInp', g.imageHeight(), (function(mrow){
			return function(){
				if(mrow >= g.rows()){
					$(this).remove()
				}else{
					$(this)
						.css('top', g.printerMargin() + mrow * (g.imageHeight() + g.imageMargin()) + 'mm')
						.height(g.imageHeight() + 'mm')
					setVerticalLines($(this).find('line'), $(this).height())
				}
			}
		})(row))
	}
})

addMeasure('#topDiv', 'printerMarginInp', g.printerMargin(), function(){
	$(this)
		.css('left', 0)
		.width(g.printerMargin() + 'mm')
	setHorizontalLines($(this).find('line'), $(this).width())
}, function(){
	g.printerMargin(Number($(this).val()))
	$('.printerMarginInp').val(g.printerMargin())
})
addMeasure('#topDiv', 'printerMarginInp', g.printerMargin(), function(){
	$(this)
		.css('right', 0)
		.width(g.printerMargin() + 'mm')
	setHorizontalLines($(this).find('line'), $(this).width())
}, function(){
	g.printerMargin(Number($(this).val()))
	$('.printerMarginInp').val(g.printerMargin())
})

addMeasure('#leftDiv', 'printerMarginInp', g.printerMargin(), function(){
	$(this)
		.css('top', 0)
		.height(g.printerMargin() + 'mm')
	setVerticalLines($(this).find('line'), $(this).height())
}, function(){
	g.printerMargin(Number($(this).val()))
	$('.printerMarginInp').val(g.printerMargin())
})
addMeasure('#leftDiv', 'printerMarginInp', g.printerMargin(), function(){
	$(this)
		.css('bottom', 0)
		.height(g.printerMargin() + 'mm')
	setVerticalLines($(this).find('line'), $(this).height())
}, function(){
	g.printerMargin(Number($(this).val()))
	$('.printerMarginInp').val(g.printerMargin())
})

$(window).on('resize', function(){
	//center paper in body
	const mleft = 0.5 * ($(window).width() - $('#paper').width())
	$('#paper').css('left', Math.max(sideDivWidth + sideDivMargin, mleft))
	const mtop = 0.5 * ($(window).height() - $('#paper').height())
	$('#paper').css('top', Math.max(sideDivHeight + sideDivMargin, mtop))
})

$('#paper').on('mlayout', function(e){stopProp(e)
	$(this)
		.width(g.paperWidth() + 'mm')
		.height(g.paperHeight() + 'mm')
	$('#printArea').trigger('mlayout')
})

$('#printArea').on('mlayout', function(e){stopProp(e)
	$(this)
		.css('left', g.printerMargin() + 'mm')
		.css('top', g.printerMargin() + 'mm')
		.width(g.printWidth() + 'mm')
		.height(g.printHeight() + 'mm')
	$('.box, .measure').trigger('mlayout')
})

//g.on_printerMargin_changed(() => {console.log(g.printerMargin())})

$('#mbutton').click(function(){
	g.rows(g.rows() + 1)
	g.columns(g.columns() + 1)
})

$(document).ready(function(){
	g.columns(3)
	g.rows(4)
	$('.printerMarginInp').first().val(g.printerMargin()).trigger('change')
	// $('.imageMarginInp').first().val(g.imageMargin()).trigger('change')
	// $('.imageWidthInp').first().val(g.imageWidth()).trigger('change')
	// $('.imageWidthInp').first().val(g.imageWidth()).trigger('change')
	// $('.imageHeightInp').first().val(g.imageHeight()).trigger('change')
	$('#paper').trigger('mlayout')
	$(window).trigger('resize')
})
