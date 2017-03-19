const $ = require('jquery')
const g = require('./mvarstore.js')
const managerBoxesMeasures = require('./managerBoxesMeasures.js')

const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAA1JREFUCJlj+D/T+D8ABzECy352aNAAAAAASUVORK5CYII='

const sideDivWidth = 80 //px
const sideDivHeight = 50 //px
const sideDivMargin = 10 //px

const paper = $('#paper')
const printArea = $('#printArea')

const topSide = $('#topSide')
const leftSide = $('#leftSide')
const rightSide = $('#rightSide')
const bottomSide = $('#bottomSide')

managerBoxesMeasures({topSide, leftSide, /*rightSide, bottomSide,*/ boxContainer: printArea, g})

topSide.height(sideDivHeight).width('100%').css('top', -sideDivHeight - sideDivMargin)
leftSide.width(sideDivWidth).height('100%').css('left', -sideDivWidth - sideDivMargin)

rightSide.width(sideDivWidth).height('100%').css('right', -sideDivWidth - sideDivMargin)
bottomSide.height(sideDivHeight).width('100%').css('bottom', -sideDivHeight - sideDivMargin)

g.on_paperWidth_changed( () => { paper.trigger('mlayout') })
g.on_paperHeight_changed( () => { paper.trigger('mlayout') })

g.on_printerMargin_changed( () => { printArea.trigger('mlayout') })

function addMeasure(parent, inputClass, inputValue, layoutFunc, inputFunc) {
	const inp = $('<input class="' + inputClass + '" type="number">')
		.change(function(){
			$.proxy(inputFunc, $(this))()
		})

	$('<div class="measure screenAbsolute"><svg><g stroke-width="2px" stroke="black"><line/><line/><line/></g></svg></div>')
		.append(inp)
		.on('mlayout', function(e){
			e.stopPropagation()
			e.preventDefault()
			//execute bound to this
			$.proxy(layoutFunc, $(this))()
		})
		.appendTo(parent)
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

addMeasure(topSide, 'printerMarginInp', g.printerMargin(), function(){
	$(this)
		.css('left', 0)
		.width(g.printerMargin() + 'mm')
	setHorizontalLines($(this).find('line'), $(this).width())
}, function(){
	g.printerMargin(Number($(this).val()))
	$('.printerMarginInp').val(g.printerMargin())
})
addMeasure(topSide, 'printerMarginInp', g.printerMargin(), function(){
	$(this)
		.css('right', 0)
		.width(g.printerMargin() + 'mm')
	setHorizontalLines($(this).find('line'), $(this).width())
}, function(){
	g.printerMargin(Number($(this).val()))
	$('.printerMarginInp').val(g.printerMargin())
})

addMeasure(leftSide, 'printerMarginInp', g.printerMargin(), function(){
	$(this)
		.css('top', 0)
		.height(g.printerMargin() + 'mm')
	setVerticalLines($(this).find('line'), $(this).height())
}, function(){
	g.printerMargin(Number($(this).val()))
	$('.printerMarginInp').val(g.printerMargin())
})
addMeasure(leftSide, 'printerMarginInp', g.printerMargin(), function(){
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
	const mleft = 0.5 * ($(window).width() - paper.width())
	paper.css('left', Math.max(sideDivWidth + sideDivMargin, mleft))
	const mtop = 0.5 * ($(window).height() - paper.height())
	paper.css('top', Math.max(sideDivHeight + sideDivMargin, mtop))
})

paper.on('mlayout', function(e){
	e.stopPropagation()
	e.preventDefault()
	$(this)
		.width(g.paperWidth() + 'mm')
		.height(g.paperHeight() + 'mm')
})

printArea.on('mlayout', function(e){
	e.stopPropagation()
	e.preventDefault()
	$(this)
		.css('left', g.printerMargin() + 'mm')
		.css('top', g.printerMargin() + 'mm')
		.width(g.printWidth() + 'mm')
		.height(g.printHeight() + 'mm')
})

//g.on_printerMargin_changed(() => {console.log(g.printerMargin())})

$('#mbutton').click(function(){
	g.rows(g.rows() + 1)
	g.columns(g.columns() + 1)
})

$(document).ready(function(){
	g.columns(3)
	g.rows(4)
	// $('.printerMarginInp').first().val(g.printerMargin()).trigger('change')
	// $('.imageMarginInp').first().val(g.imageMargin()).trigger('change')
	// $('.imageWidthInp').first().val(g.imageWidth()).trigger('change')
	// $('.imageWidthInp').first().val(g.imageWidth()).trigger('change')
	// $('.imageHeightInp').first().val(g.imageHeight()).trigger('change')
	paper.trigger('mlayout')
	$(window).trigger('resize')
})
