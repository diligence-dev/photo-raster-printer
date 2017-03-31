import $ from 'jquery'
import g from './mvarstore.js'
import managerBoxesMeasures from './managerBoxesMeasures.js'

const headerHeight = 80 //px
const sideDivWidth = 80 //px
const sideDivHeight = 50 //px
const sideDivMargin = 10 //px

const paper = $('#paper')
const printArea = $('#printArea')

const topSide = $('#topSide')
const leftSide = $('#leftSide')
const rightSide = $('#rightSide')
const bottomSide = $('#bottomSide')

$('header').height(headerHeight)

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
	paper.css('top', Math.max(sideDivHeight + sideDivMargin + headerHeight + 20, mtop))
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

$('#plusColumn').on('click', () => { g.columns(g.columns() + 1) })
$('#minusColumn').on('click', () => { g.columns(Math.max(1, g.columns() - 1)) })
$('#plusRow').on('click', () => { g.rows(g.rows() + 1) })
$('#minusRow').on('click', () => { g.rows(Math.max(1, g.rows() - 1)) })

managerBoxesMeasures({$, topSide, leftSide, rightSide, bottomSide, boxContainer: printArea, g})


$(document).ready(function(){
	g.rows(4)
	g.columns(3)
	g.paperWidth(g.paperWidth())
	$(window).trigger('resize')
})
