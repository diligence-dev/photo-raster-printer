module.exports = function({topSide, leftSide, /*rightSide, bottomSide,*/ boxContainer, g}) {
	const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAA1JREFUCJlj+D/T+D8ABzECy352aNAAAAAASUVORK5CYII='

	const $ = require('jquery')
	const boxesAndMeasures = []
	function layoutBams(){
		//bom = box or measure
		boxesAndMeasures.forEach( boxOrMeasure => { boxOrMeasure.trigger('mlayout') } )
	}
	//urls to blobs the user inserted
	const blobs = {}

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
			boxesAndMeasures.push(this.div)
		},
		boxDragEnter: function(e) {
			e.stopPropagation()
			e.preventDefault()
			this.div
				.css('box-shadow', '0 0 0 20px green')
				.css('z-index', '1')
		},
		boxDragLeave: function(e) {
			e.stopPropagation()
			e.preventDefault()
			this.div
				.css('box-shadow', 'initial')
				.css('z-index', 'initial')
		},
		boxDropFunc: function(col, row) {
			return function(e) {
				e.stopPropagation()
				e.preventDefault()
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
			return function(e){
				e.stopPropagation()
				e.preventDefault()
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

	const horizontalMeasureProto = {
		configure: function({inputClass, onInputChanged, getLeft, getWidth}){
			this.inputClass = inputClass
			this.onInputChanged = onInputChanged
			this.getLeft = getLeft
			this.getWidth = getWidth
			return this
		},
		init: function(col){
			this.col = col
			this.div = $('<div class="measure screenAbsolute"><svg><g stroke-width="2px" stroke="black"><line/><line/><line/></g></svg></div>')

			const input = $('<input class="' + this.inputClass + '" type="number">')
			input
				.change( () => { this.onInputChanged(input.val()) })
				.appendTo(this.div)

			this.lines = this.div.find('line')
			this.setupLines(this.lines)

			this.div
				.on('mlayout', this.layout)
				.appendTo(topSide)
			boxesAndMeasures.push(this.div)
		},
		setupLines: function(lines) {
			lines[0].setAttribute('x1', 5)
			lines[0].setAttribute('y1', '60%')
			lines[0].setAttribute('y2', '60%')

			lines[1].setAttribute('x1', 5)
			lines[1].setAttribute('x2', 5)
			lines[1].setAttribute('y1', '20%')
			lines[1].setAttribute('y2', '100%')

			lines[2].setAttribute('y1', '20%')
			lines[2].setAttribute('y2', '100%')
		},
		layout: function(e){
			e.stopPropagation()
			e.preventDefault()
			if(this.col >= g.columns()){
				this.div.remove()
			}else{
				this.div
					.css('left', this.getLeft(this.col) + 'mm')
					.width(this.getWidth() + 'mm')

				this.lines[0].setAttribute('x2', this.div.width() - 5)
				this.lines[2].setAttribute('x1', this.div.width() - 5)
				this.lines[2].setAttribute('x2', this.div.width() - 5)
			}
		}
	}
	const horizontalImageMeasureProto = Object.create(horizontalMeasureProto).configure({
		inputClass: 'imageWidthInp',
		onInputChanged: inputValue => {
			console.log('todo: imageWidthInp changes imageWidth')
			g.imageMargin( Number(inputValue) ) },
		getLeft: mcol => g.printerMargin() + mcol * (g.imageWidth() + g.imageMargin()),
		getWidth: () => g.imageWidth()
	})
	const horizontalMarginMeasureProto = Object.create(horizontalMeasureProto).configure({
		inputClass: 'imageMarginInp',
		onInputChanged: inputValue => {	g.imageMargin( Number(inputValue) ) },
		getLeft: mcol => g.printerMargin() + mcol * (g.imageWidth() + g.imageMargin()) - g.imageMargin(),
		getWidth: () => g.imageMargin()
	})

	g.preColumnsChange(function(prevColumns, currColumns){
		for (let col = prevColumns; col < currColumns; col++) {
			if(col > 0){
				Object.create(horizontalMarginMeasureProto).init(col)
			}
			Object.create(horizontalImageMeasureProto).init(col)

			for (let row = 0; row < g.rows(); row++) {
				Object.create(boxProto).init(col, row)
			}
		}
	})
	g.on_columns_changed(layoutBams)

	const verticalMeasureProto = {
		configure: function({inputClass, onInputChanged, getTop, getHeight}){
			this.inputClass = inputClass
			this.onInputChanged = onInputChanged
			this.getTop = getTop
			this.getHeight = getHeight
			return this
		},
		init: function(row){
			this.row = row
			this.div = $('<div class="measure screenAbsolute"><svg><g stroke-width="2px" stroke="black"><line/><line/><line/></g></svg></div>')

			const input = $('<input class="' + this.inputClass + '" type="number">')
			input
				.change( () => { this.onInputChanged(input.val()) })
				.appendTo(this.div)

			this.lines = this.div.find('line')
			this.setupLines(this.lines)

			this.div
				.on('mlayout', this.layout)
				.appendTo(leftSide)
			boxesAndMeasures.push(this.div)
		},
		setupLines: function(lines) {
			lines[0].setAttribute('y1', 5)
			lines[0].setAttribute('x1', '60%')
			lines[0].setAttribute('x2', '60%')

			lines[1].setAttribute('y1', 5)
			lines[1].setAttribute('y2', 5)
			lines[1].setAttribute('x1', '20%')
			lines[1].setAttribute('x2', '100%')

			lines[2].setAttribute('x1', '20%')
			lines[2].setAttribute('x2', '100%')
		},
		layoutFunc: function(e){
			e.stopPropagation()
			e.preventDefault()
			if(this.row >= g.rows()){
				this.div.remove()
			}else{
				this.div
					.css('top', this.getTop(this.row) + 'mm')
					.height(this.getHeight() + 'mm')

				this.lines[0].setAttribute('y2', this.div.height() - 5)
				this.lines[2].setAttribute('y1', this.div.height() - 5)
				this.lines[2].setAttribute('y2', this.div.height() - 5)
			}
		}
	}
	const verticalImageMeasureProto = Object.create(verticalMeasureProto).configure({
		inputClass: 'imageHeightInp',
		onInputChanged: inputValue => {
			console.log('todo: imageHeightInp changes imageHeight')
			g.imageMargin( Number(inputValue) ) },
		getTopFunction: mrow => g.printerMargin() + mrow * (g.imageWidth() + g.imageMargin()),
		getHeightFunction: () => g.imageHeight()
	})
	const verticalMarginMeasureProto = Object.create(verticalMeasureProto).configure({
		inputClass: 'imageMarginInp',
		onInputChanged: inputValue => { g.imageMargin( Number(inputValue) ) },
		getLeftFunction: mrow => g.printerMargin() + mrow * (g.imageWidth() + g.imageMargin()) - g.imageMargin(),
		getWidthFunction: () => g.imageMargin()
	})

	g.preRowsChange(function(prevRows, currRows){
		for (let row = prevRows; row < currRows; row++) {
			if(row > 0){
				Object.create(verticalMarginMeasureProto).init(row)
			}
			Object.create(verticalImageMeasureProto).init(row)

			for (let col = 0; col < g.columns(); col++) {
				Object.create(boxProto).init(col, row)
			}
		}
	})
	g.on_rows_changed(layoutBams)


	g.on_paperWidth_changed(layoutBams)
	g.on_paperHeight_changed(layoutBams)

	g.on_printerMargin_changed(layoutBams)
	g.on_imageMargin_changed(layoutBams)
}
