const $ = require('jquery')
const g = require('./mvarstore.js')
const managerBoxesMeasures = require('./managerBoxesMeasures.js')

const sideDivWidth = 80 //px
const sideDivHeight = 50 //px
const sideDivMargin = 10 //px

const paper = $('#paper')
const printArea = $('#printArea')

const topSide = $('#topSide')
const leftSide = $('#leftSide')
const rightSide = $('#rightSide')
const bottomSide = $('#bottomSide')

topSide.height(sideDivHeight).width('100%').css('top', -sideDivHeight - sideDivMargin)
leftSide.width(sideDivWidth).height('100%').css('left', -sideDivWidth - sideDivMargin)

rightSide.width(sideDivWidth).height('100%').css('right', -sideDivWidth - sideDivMargin)
bottomSide.height(sideDivHeight).width('100%').css('bottom', -sideDivHeight - sideDivMargin)

g.on_paperWidth_changed( () => {
	paper.trigger('mlayout')
	printArea.trigger('mlayout')})
g.on_paperHeight_changed( () => {
	paper.trigger('mlayout')
	printArea.trigger('mlayout')})

g.on_printerMargin_changed( () => { printArea.trigger('mlayout') })

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

managerBoxesMeasures({$, topSide, leftSide, rightSide, bottomSide, boxContainer: printArea, g})

$(document).ready(function(){
	g.rows(4)
	g.columns(3)
	$('.printerMarginInp').first().val(g.printerMargin()).trigger('change')
	$('.imageMarginInp').first().val(g.imageMargin()).trigger('change')
	g.paperWidth(g.paperWidth())
	$('#bottomSide').find('input').val(g.paperWidth())
	$('#rightSide').find('input').val(g.paperHeight())
	$(window).trigger('resize')
})
