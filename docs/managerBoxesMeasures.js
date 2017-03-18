const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAA1JREFUCJlj+D/T+D8ABzECy352aNAAAAAASUVORK5CYII='

const $ = require('jquery')
//bams = boxes and measures - layout gets called on these
const bams = []
function layoutBams(){
	//bom = box or measure
	bams.forEach( bom => { bom.trigger('mlayout') } )
}
//urls to blobs the user inserted
const blobs = {}

function stopProp(e) {
	e.stopPropagation()
	e.preventDefault()
}

module.exports = function({leftSide, rightSide, topSide, bottomSide, boxContainer, varStore: g}) {
	const boxProto = {
		init: function(col, row){
			this.img = $(`<img src="${blobs[[col, row]] || placeholder}">`)
				.on('load', this.scaleImage)
			this.div = $('<div class="box"></div>')
				.on('dragenter', this.boxDragEnter)
				.on('dragover', this.stopProp)
				.on('dragleave', this.boxDragLeave)
				.on('mlayout', this.boxLayoutFunc(col, row))
				.on('drop', this.boxDropFunc(col, row))
				.append(this.img)
				.appendTo(boxContainer)
			bams.push(this.div)
		},
		boxDragEnter: function(e) {stopProp(e)
			this.div
				.css('box-shadow', '0 0 0 20px green')
				.css('z-index', '1')
		},
		boxDragLeave: function(e) {stopProp(e)
			this.div
				.css('box-shadow', 'initial')
				.css('z-index', 'initial')
		},
		boxDropFunc: function(col, row) {
			return function(e) {stopProp(e)
				if (e.originalEvent.dataTransfer.files.length > 0) {
					const mURL = window.URL.createObjectURL(e.originalEvent.dataTransfer.files[0])
					blobs[[col, row]] = mURL
					this.img
						.attr('src', mURL)
						.trigger('load')
				}
				this.div.trigger('dragleave')
			}
		},
		scaleImage: function() {
			const widthScale = this.div.parent().width() / this.div.prop('naturalWidth')
			const heightScale = this.div.parent().height() / this.div.prop('naturalHeight')

			if (widthScale > heightScale) {
				this.div
					.width(widthScale * this.div.prop('naturalWidth'))
					.height(widthScale * this.div.prop('naturalHeight'))
					.css('top', -0.5 * (this.div.height() - this.div.parent().height()))
			} else {
				this.div
					.width(heightScale * this.div.prop('naturalWidth'))
					.height(heightScale * this.div.prop('naturalHeight'))
					.css('left', -0.5 * (this.div.width() - this.div.parent().width()))
			}
		},
		boxLayoutFunc: function(col, row){
			return function(e){stopProp(e)
				if(col >= g.columns() || row >= g.rows()){
					this.div.remove()
				}else{
					this.div
						.width(g.imageWidth() + 'mm')
						.height(g.imageHeight() + 'mm')
						.css('top', row * (g.imageMargin() + g.imageHeight()) + 'mm')
						.css('left', col * (g.imageMargin() + g.imageWidth()) + 'mm')
					this.img.trigger('load')
				}
			}
		}
	}

	function addMeasure(targetSelector, inputClass, inputValue, layoutFunc, inputFunc) {
		const div = $('<div class="measure screenAbsolute"><svg><g stroke-width="2px" stroke="black"><line/><line/><line/></g></svg></div>')
		const inp = $('<input class="' + inputClass + '" type="number">')
			.change( () => {
				$.proxy(inputFunc, $(this))()
			})

		div	.append(inp)
			.on('mlayout', function(e){stopProp(e)
				//execute bound to this
				$.proxy(layoutFunc, $(this))()
			})
			.appendTo(targetSelector)
		bams.push(div)
	}

	// addMeasure('#topDiv', 'imageWidthInp', g.imageWidth(), (function(mcol){
	// 	return function(){
	// 		if(mcol >= g.columns()){
	// 			$(this).remove()
	// 		}else{
	// 			$(this)
	// 				.css('left', g.printerMargin() + mcol * (g.imageWidth() + g.imageMargin()) + 'mm')
	// 				.width(g.imageWidth() + 'mm')
	// 			setHorizontalLines($(this).find('line'), $(this).width())
	// 		}
	// 	}
	// })(col))

	const horizontalMeasureProto = {
		init: function(col){
			if(col > 0){
				//new image margin measure
				this.marginDiv = $('<div class="measure screenAbsolute"><svg><g stroke-width="2px" stroke="black"><line/><line/><line/></g></svg></div>')
				this.lines = this.setupLines(this.marginDiv)
				const imageMarginInp = $('<input class="imageMarginInp" type="number">')
					.change( () => { g.imageMargin(Number( $(this).val() )) })

				this.marginDiv
					.append(imageMarginInp)
					.appendTo(topSide)
			}
			//new box measure
			this.boxDiv = $('<div class="measure screenAbsolute"><svg><g stroke-width="2px" stroke="black"><line/><line/><line/></g></svg></div>')
			const imagewidthInp = $('<input class="imageWidthInp" type="number">')
				.change( () => {
					g.imageMargin(Number( $(this).val() ))
					console.log('todo: imageWidthInp changes imageWidth')
				})

			this.div.append(imagewidthInp)
				.on('mlayout', this.layoutFunc(col))
				.appendTo(topSide)
			bams.push(this.div)
		},



		setupLines: function(div) {
			const lines = div.find('line')
			lines[0].setAttribute('x1', 5)
			lines[0].setAttribute('y1', '60%')
			lines[0].setAttribute('y2', '60%')

			lines[1].setAttribute('x1', 5)
			lines[1].setAttribute('x2', 5)
			lines[1].setAttribute('y1', '20%')
			lines[1].setAttribute('y2', '100%')

			lines[2].setAttribute('y1', '20%')
			lines[2].setAttribute('y2', '100%')
			return lines
			// this.lines[0].setAttribute('x2', parentWidth - 5)
			// this.lines[2].setAttribute('x1', parentWidth - 5)
			// this.lines[2].setAttribute('x2', parentWidth - 5)
		},

		layoutFunc: function(col){
			return function(e){stopProp(e)
				if(col >= g.columns()){
					console.log('todo: check typeof marginDiv ===', typeof this.marginDiv)
					if(typeof this.marginDiv === 'undefined'){
						this.marginDiv.remove()
					}
					this.boxDiv.remove()
				}else{
					$(this)
						.css('left', g.printerMargin() + col * (g.imageWidth() + g.imageMargin()) - g.imageMargin() + 'mm')
						.width(g.imageMargin() + 'mm')
					this.setupLines($(this).find('line'), $(this).width())
				}
			}
		}
	}


	g.preColumnsChange(function(prevColumns, currColumns){
		for (let col = prevColumns; col < currColumns; col++) {
			Object.create(horizontalMeasureProto).init(col)

			for (let row = 0; row < g.rows(); row++) {
				Object.create(boxProto).init(col, row)
			}
		}
	})
	g.on_columns_changed(layoutBams)























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
	g.on_rows_changed(layoutBams)

	g.on_imageMargin_changed(layoutBams)
}
