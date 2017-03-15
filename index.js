const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAA1JREFUCJlj+D/T+D8ABzECy352aNAAAAAASUVORK5CYII='

const sideDivWidth = 80 //px
const sideDivHeight = 50 //px
const sideDivMargin = 10 //px

let g

function stopProp(e) {
	e.stopPropagation()
	e.preventDefault()
}

function addMeasure(targetSelector, layoutFunc, inputFunc) {
	$('<div class="measure screenAbsolute"></div>')
		.append('<svg><g stroke-width="2px" stroke="black"><line/><line/><line/></g></svg>')
		.append('<input type="number">')
		.on('mlayout', function(e){stopProp(e)
			//execute bound to this
			$.proxy(layoutFunc, $(this))()
		})
		.appendTo(targetSelector)
		.find('input')
			.change(function(){
				$.proxy(inputFunc, $(this))()
			})
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
			let mURL = window.URL.createObjectURL(e.originalEvent.dataTransfer.files[0])
			blobs[[mcol, mrow]] = mURL
			$(this).find('img')
				.attr('src', mURL)
				.trigger('load')
		}
		$(this).trigger('dragleave')
	}
}

function scaleImage() {
	let widthScale = $(this).parent().width() / $(this).prop('naturalWidth')
	let heightScale = $(this).parent().height() / $(this).prop('naturalHeight')

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

g = (function(){
	let _paperWidth = 210 //mm
	let _paperHeight = 297 //mm

	let _printerMargin = 10 //mm
	let _imageMargin = 5 //mm

	let _columns = 3
	let _rows = 4

	let _printWidth = 0 //mm
	let _printHeight = 0 //mm

	let _imageWidth = 0 //mm
	let _imageHeight = 0 //mm

	return {
		calcImageWidth: function(){
			_printWidth = _paperWidth - 2 * _printerMargin
			_imageWidth = (_printWidth - (_columns - 1) * _imageMargin) / _columns
		},
		calcImageHeight: function(){
			_printHeight = _paperHeight - 2 * _printerMargin
			_imageHeight = (_printHeight - (_rows - 1) * _imageMargin) / _rows
		},

		paperWidth: function(){
			return _paperWidth
		},
		setPaperWidth: function(v){
			_paperWidth = v
			this.calcImageWidth()
			$('#paper').trigger('mlayout')
		},
		paperHeight: function(){
			return _paperHeight
		},
		setPaperHeight: function(v){
			_paperHeight = v
			this.calcImageHeight()
			$('#paper').trigger('mlayout')
		},

		printerMargin: function(){
			return _printerMargin
		},
		setPrinterMargin: function(v){
			_printerMargin = v
			this.calcImageWidth()
			this.calcImageHeight()
			$('#printArea').trigger('mlayout')
		},
		imageMargin: function(){
			return _imageMargin
		},
		setImageMargin: function(v){
			_imageMargin = v
			this.calcImageWidth()
			this.calcImageHeight()
			$('.box, .measure').trigger('mlayout')
		},

		columns: function(){
			return _columns
		},
		setColumns: function(v){
			//add new imageboxes and measures
			for (let col = _columns; col < v; col++) {
				for (let row = 0; row < _rows; row++) {
					//new image box
					let x = $('<div class="box"><img></div>')
					x
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
					addMeasure('#topDiv', (function(mcol){
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
				addMeasure('#topDiv', (function(mcol){
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
			_columns = v
			this.calcImageWidth()
			$('.box, .measure').trigger('mlayout')
		},
		rows: function(){
			return _rows
		},
		setRows: function(v){
			//not run if columns is not increased
			for (let row = _rows; row < v; row++) {
				for (let col = 0; col < _columns; col++) {
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
			_rows = v
			this.calcImageHeight()
			$('.box, .measure').trigger('mlayout')
		},

		printWidth: function(){
			return _printWidth
		},
		printHeight: function(){
			return _printHeight
		},
		imageWidth: function(){
			return _imageWidth
		},
		imageHeight: function(){
			return _imageHeight
		},
	}
}())

addMeasure('#topDiv', function(){
	$(this)
		.css('left', 0)
		.width(g.printerMargin() + 'mm')
	setHorizontalLines($(this).find('line'), $(this).width())
}, function(){
	g.setPrinterMargin($(this).val())
	$('.printerMarginInp').val(g.printerMargin())
})
addMeasure('#topDiv', function(){
	$(this)
		.css('right', 0)
		.width(g.printerMargin() + 'mm')
	setHorizontalLines($(this).find('line'), $(this).width())
}, function(){
	g.setPrinterMargin($(this).val())
	$('.printerMarginInp').val(g.printerMargin())
})

addMeasure('#leftDiv', function(){
	$(this)
		.css('top', 0)
		.height(g.printerMargin() + 'mm')
	setVerticalLines($(this).find('line'), $(this).height())
}, function(){
	g.setPrinterMargin($(this).val())
	$('.printerMarginInp').val(g.printerMargin())
})
addMeasure('#leftDiv', function(){
	$(this)
		.css('bottom', 0)
		.height(g.printerMargin() + 'mm')
	setVerticalLines($(this).find('line'), $(this).height())
}, function(){
	g.setPrinterMargin($(this).val())
	$('.printerMarginInp').val(g.printerMargin())
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

for (let col = 0; col < g.columns(); col++) {
	for (let row = 0; row < g.rows(); row++) {
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



for (let col = 0; col < g.columns(); col++) {
	if(col > 0){
		addMeasure('#topDiv', (function(mcol){
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
	addMeasure('#topDiv', (function(mcol){
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

for (let row = 0; row < g.rows(); row++) {
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

$('#mbutton').click(function(){
	g.setPrinterMargin(g.printerMargin()+1)
})



$(document).ready(function(){
	g.calcImageWidth()
	g.calcImageHeight()
	$('#paper').trigger('mlayout')
	$(window).trigger('resize')
})
