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

var g = {
	_paperWidth: 210, //mm
	_paperHeight: 297, //mm

	_printerMargin: 10, //mm
	_imageMargin: 5, //mm

	_columns: 3, //mm
	_rows: 4, //mm

	_printWidth: 0, //mm
	_printHeight: 0, //mm

	_imageWidth: 0, //mm
	_imageHeight: 0, //mm

	calcImageWidth: function(){
		this._printWidth = this._paperWidth - 2 * this._printerMargin
		this._imageWidth = (this._printWidth - (this._columns - 1) * this._imageMargin) / this._columns
	},
	calcImageHeight: function(){
		this._printHeight = this._paperHeight - 2 * this._printerMargin
		this._imageHeight = (this._printHeight - (this._rows - 1) * this._imageMargin) / this._rows
	},

	paperWidth: function(){
		return this._paperWidth
	},
	setPaperWidth: function(v){
		this._paperWidth = v
		this.calcImageWidth()
		$('#paper').trigger('mlayout')
	},
	paperHeight: function(){
		return this._paperHeight
	},
	setPaperHeight: function(v){
		this._paperHeight = v
		this.calcImageHeight()
		$('#paper').trigger('mlayout')
	},

	printerMargin: function(){
		return this._printerMargin
	},
	setPrinterMargin: function(v){
		this._printerMargin = v
		this.calcImageWidth()
		this.calcImageHeight()
		$('#printArea').trigger('mlayout')
	},
	imageMargin: function(){
		return this._imageMargin
	},
	setImageMargin: function(v){
		this._imageMargin = v
		this.calcImageWidth()
		this.calcImageHeight()
		$('.box, .measure').trigger('mlayout')
	},

	columns: function(){
		return this._columns
	},
	setColumns: function(v){
		this._columns = v
		this.calcImageWidth()
		// TODO add boxes/measures
		$('.box, .measure').trigger('mlayout')
	},
	rows: function(){
		return this._rows
	},
	setRows: function(v){
		this._rows = v
		this.calcImageHeight()
		// TODO add boxes/measures
		$('.box, .measure').trigger('mlayout')
	},

	printWidth: function(){
		return this._printWidth
	},
	printHeight: function(){
		return this._printHeight
	},
	imageWidth: function(){
		return this._imageWidth
	},
	imageHeight: function(){
		return this._imageHeight
	},
}

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
		.width(g.printerMargin() + 'mm')
	setHorizontalLines($(this).find('line'), $(this).width())
})
addMeasure('#topDiv', function(){
	$(this)
		.css('right', 0)
		.width(g.printerMargin() + 'mm')
	setHorizontalLines($(this).find('line'), $(this).width())
})

addMeasure('#leftDiv', function(){
	$(this)
		.css('top', 0)
		.height(g.printerMargin() + 'mm')
	setVerticalLines($(this).find('line'), $(this).height())
})
addMeasure('#leftDiv', function(){
	$(this)
		.css('bottom', 0)
		.height(g.printerMargin() + 'mm')
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

function boxLayoutFunction(mcol, mrow){
	return function(e){stopProp(e)
		if(mcol >= g.imageMargin() || mrow >= g.rows()){
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
	//saving x as lx, otherwise x == g.imageMargin() onDrop for each box
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

for (var col = 0; col < g.columns(); col++) {
	for (var row = 0; row < g.rows(); row++) {
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

for (var col = 0; col < g.columns(); col++) {
	if(col > 0){
		addMeasure('#topDiv', (function(mcol){
			return function(){
				if(mcol >= g.imageMargin()){
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
	addMeasure('#topDiv', (function(mcol){
		return function(){
			if(mcol >= g.imageMargin()){
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

for (var row = 0; row < g.rows(); row++) {
	if(row > 0){
		addMeasure('#leftDiv', (function(mrow){
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
	addMeasure('#leftDiv', (function(mrow){
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

function mclick() {
	g.setRows(g.rows()+1)
}


$(document).ready(function(){
	g.calcImageWidth()
	g.calcImageHeight()
	$('#paper').trigger('mlayout')
	$(window).trigger('resize')
})
