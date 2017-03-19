module.exports = function({topSide, leftSide, /*rightSide, bottomSide,*/ boxContainer, g}) {
	const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAA1JREFUCJlj+D/T+D8ABzECy352aNAAAAAASUVORK5CYII='

	const $ = require('jquery')
	const boxesAndMeasures = []
	function layoutBoxesAndMeasures(){
		boxesAndMeasures.forEach( boxOrMeasure => { boxOrMeasure.trigger('mlayout') } )
	}
	//urls to blobs the user inserted
	const blobs = {}

	const boxProto = {
		init: function(col, row){
			this.col = col
			this.row = row
			this.div = $('<div class="box"></div>')
				.on('dragenter', this.dragEnter.bind(this))
				.on('dragover', e => {e.preventDefault();e.stopPropagation()})
				.on('dragleave', this.dragLeave.bind(this))
				.on('mlayout', this.layout.bind(this))
				.on('drop', this.drop.bind(this))
				.appendTo(boxContainer)
			const url = blobs[[col, row]] || placeholder
			this.img = $(`<img src="${url}">`)
			this.img
				.on('load', this.scaleImage.bind(this))
				.appendTo(this.div)
			boxesAndMeasures.push(this.div)
		},
		dragEnter: function(e) {
			e.stopPropagation()
			e.preventDefault()
			this.div
				.css('box-shadow', '0 0 0 20px green')
				.css('z-index', '1')
		},
		dragLeave: function(e) {
			e.stopPropagation()
			e.preventDefault()
			this.div
				.css('box-shadow', 'initial')
				.css('z-index', 'initial')
		},
		drop: function(e) {
			e.stopPropagation()
			e.preventDefault()
			if (e.originalEvent.dataTransfer.files.length > 0) {
				const mURL = window.URL.createObjectURL(e.originalEvent.dataTransfer.files[0])
				blobs[[this.col, this.row]] = mURL
				this.img
					.attr('src', mURL)
					.trigger('load')
			}
			this.div.trigger('dragleave')
		},
		scaleImage: function() {
			const widthScale = this.div.width() / this.img.prop('naturalWidth')
			const heightScale = this.div.height() / this.img.prop('naturalHeight')

			if (widthScale > heightScale) {
				this.img
					.width(widthScale * this.img.prop('naturalWidth'))
					.height(widthScale * this.img.prop('naturalHeight'))
					.css('top', -0.5 * (this.img.height() - this.div.height()))
			} else {
				this.img
					.width(heightScale * this.img.prop('naturalWidth'))
					.height(heightScale * this.img.prop('naturalHeight'))
					.css('left', -0.5 * (this.img.width() - this.div.width()))
			}
		},
		layout: function(e){
			e.stopPropagation()
			e.preventDefault()
			if(this.col >= g.columns() || this.row >= g.rows()){
				this.div.remove()
			}else{
				this.div
					.width(g.imageWidth() + 'mm')
					.height(g.imageHeight() + 'mm')
					.css('top', this.row * (g.imageMargin() + g.imageHeight()) + 'mm')
					.css('left', this.col * (g.imageMargin() + g.imageWidth()) + 'mm')
				this.img.trigger('load')
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
				.change( () => { this.onInputChanged(Number( input.val() )) })
				.appendTo(this.div)

			this.lines = this.div.find('line')
			this.setupLines(this.lines)

			this.div
				.on('mlayout', this.layout.bind(this))
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

	//add printer margin measures
	Object.create(horizontalMeasureProto).configure({
		inputClass: 'printerMarginInp',
		onInputChanged: inputValue => {
			g.printerMargin(inputValue)
			$('.printerMarginInp').val(inputValue) },
		getLeft: () => 0,
		getWidth: () => g.printerMargin()
	}).init(-1)
	Object.create(horizontalMeasureProto).configure({
		inputClass: 'printerMarginInp',
		onInputChanged: inputValue => {
			g.printerMargin(inputValue)
			$('.printerMarginInp').val(inputValue) },
		getLeft: () => g.paperWidth() - g.printerMargin(),
		getWidth: () => g.printerMargin()
	}).init(-1)

	const horizontalImageMeasureProto = Object.create(horizontalMeasureProto).configure({
		inputClass: 'imageWidthInp',
		onInputChanged: inputValue => {
			console.log('todo: imageWidthInp changes imageWidth')
			g.imageMargin(inputValue) },
		getLeft: mcol => g.printerMargin() + mcol * (g.imageWidth() + g.imageMargin()),
		getWidth: () => g.imageWidth()
	})
	const horizontalMarginMeasureProto = Object.create(horizontalMeasureProto).configure({
		inputClass: 'imageMarginInp',
		onInputChanged: inputValue => {	g.imageMargin(inputValue) },
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
	g.on_columns_changed(layoutBoxesAndMeasures)

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
				.change( () => { this.onInputChanged(Number( input.val() )) })
				.appendTo(this.div)

			this.lines = this.div.find('line')
			this.setupLines(this.lines)

			this.div
				.on('mlayout', this.layout.bind(this))
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
		layout: function(e){
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

	//add printer margin measures
	Object.create(verticalMeasureProto).configure({
		inputClass: 'printerMarginInp',
		onInputChanged: inputValue => {
			g.printerMargin(inputValue)
			$('.printerMarginInp').val(inputValue) },
		getTop: () => 0,
		getHeight: () => g.printerMargin()
	}).init(-1)
	Object.create(verticalMeasureProto).configure({
		inputClass: 'printerMarginInp',
		onInputChanged: inputValue => {
			g.printerMargin(inputValue)
			$('.printerMarginInp').val(inputValue) },
		getTop: () => g.paperHeight() - g.printerMargin(),
		getHeight: () => g.printerMargin()
	}).init(-1)

	const verticalImageMeasureProto = Object.create(verticalMeasureProto).configure({
		inputClass: 'imageHeightInp',
		onInputChanged: inputValue => {
			console.log('todo: imageHeightInp changes imageHeight')
			g.imageMargin(inputValue) },
		getTop: mrow => g.printerMargin() + mrow * (g.imageHeight() + g.imageMargin()),
		getHeight: () => g.imageHeight()
	})
	const verticalMarginMeasureProto = Object.create(verticalMeasureProto).configure({
		inputClass: 'imageMarginInp',
		onInputChanged: inputValue => { g.imageMargin(inputValue) },
		getTop: mrow => g.printerMargin() + mrow * (g.imageHeight() + g.imageMargin()) - g.imageMargin(),
		getHeight: () => g.imageMargin()
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
	g.on_rows_changed(layoutBoxesAndMeasures)


	g.on_paperWidth_changed(layoutBoxesAndMeasures)
	g.on_paperHeight_changed(layoutBoxesAndMeasures)

	g.on_printerMargin_changed(layoutBoxesAndMeasures)
	g.on_imageMargin_changed(layoutBoxesAndMeasures)
}
