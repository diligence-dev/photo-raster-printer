export default function({$, topSide, leftSide, rightSide, bottomSide, boxContainer, g}) {
	const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAA1JREFUCJlj+D/T+D8ABzECy352aNAAAAAASUVORK5CYII='

	//urls to blobs the user inserted
	const blobs = {}
	const boxesAndMeasures = []
	function layoutBoxesAndMeasures(){
		boxesAndMeasures.forEach( boxOrMeasure => { boxOrMeasure.trigger('mlayout') } )
	}

	function stopProp(e){
		e.preventDefault()
		e.stopPropagation()
	}

	const boxProto = {
		init: function(col, row){
			this.col = col
			this.row = row
			this.div = $('<div class="box"></div>')
				.on('dragstart', this.dragStart.bind(this))
				.on('dragenter', this.dragEnter.bind(this))
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
			if (e.originalEvent.dataTransfer.items.length === 1) {
				this.div
					.css('box-shadow', '0 0 0 20px green')
					.css('z-index', '1')
			}
		},
		dragLeave: function() {
			this.div
				.css('box-shadow', 'initial')
				.css('z-index', 'initial')
		},
		dragStart: function(e) {
			$('#tmpDragId').removeAttr('id')
			this.img.attr('id', 'tmpDragId')
			e.originalEvent.dataTransfer.setData('startX', e.originalEvent.clientX)
			e.originalEvent.dataTransfer.setData('startY', e.originalEvent.clientY)
		},
		drop: function(e) {
			if (e.originalEvent.dataTransfer.files.length === 1) {
				stopProp(e)
				const mURL = window.URL.createObjectURL(e.originalEvent.dataTransfer.files[0])
				blobs[[this.col, this.row]] = mURL
				this.img
					.attr('src', mURL)
					.trigger('load')
				this.div.trigger('dragleave')
			}
		},
		scaleImage: function() {
			const widthScale = this.div.width() / this.img.prop('naturalWidth')
			const heightScale = this.div.height() / this.img.prop('naturalHeight')

			if (widthScale > heightScale) {
				this.img
					.width(widthScale * this.img.prop('naturalWidth'))
					.height(widthScale * this.img.prop('naturalHeight'))
					.addClass('portrait')
			} else {
				this.img
					.width(heightScale * this.img.prop('naturalWidth'))
					.height(heightScale * this.img.prop('naturalHeight'))
					.removeClass('portrait')
			}
			this.img.css('top', 0).css('left', 0)
		},
		layout: function(e){
			stopProp(e)
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

	//prevent image loading if dropped anywhere
	$(window)
		.on('dragover', stopProp)
		.on('drop', e => {
			stopProp(e)
			const img = $('#tmpDragId')

			if(img.hasClass('portrait')){
				const startY = e.originalEvent.dataTransfer.getData('startY')
				const diffY = e.originalEvent.clientY - Number(startY)
				img.css('top', '+=' + diffY)
			}else{
				const startX = e.originalEvent.dataTransfer.getData('startX')
				const diffX = e.originalEvent.clientX - Number(startX)
				img.css('left', '+=' + diffX)
			}
		})


	const horizontalMeasureProto = {
		configure: function({inputClass, controlledValue, getLeft, getWidth}){
			this.inputClass = inputClass
			this.controlledValue = controlledValue
			this.getLeft = getLeft
			this.getWidth = getWidth
			return this
		},
		init: function(col, parent = topSide){
			this.col = col
			this.div = $('<div class="measure screenAbsolute"><svg><g stroke-width="2px" stroke="black"><line/><line/><line/></g></svg></div>')

			if(typeof this.controlledValue === 'function'){
				const input = $('<input class="' + this.inputClass + '" type="number" min="0">')
				input
					.val(this.controlledValue())
					.change( () => {
						this.controlledValue(Number( input.val() ))
						$('.' + this.inputClass).val(this.controlledValue()) })
					.appendTo(this.div)
			}

			this.lines = this.div.find('line')
			this.setupLines(this.lines)

			this.div
				.on('mlayout', this.layout.bind(this))
				.appendTo(parent)
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
			stopProp(e)
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
		getLeft: mcol => g.printerMargin() + mcol * (g.imageWidth() + g.imageMargin()),
		getWidth: () => g.imageWidth()
	})
	const horizontalMarginMeasureProto = Object.create(horizontalMeasureProto).configure({
		inputClass: 'imageMarginInp',
		controlledValue: g.imageMargin,
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
		configure: function({inputClass, controlledValue, getTop, getHeight}){

			this.inputClass = inputClass
			this.controlledValue = controlledValue
			this.getTop = getTop
			this.getHeight = getHeight
			return this
		},
		init: function(row, parent = leftSide){
			this.row = row
			this.div = $('<div class="measure screenAbsolute"><svg><g stroke-width="2px" stroke="black"><line/><line/><line/></g></svg></div>')

			if(typeof this.controlledValue === 'function'){
				const input = $('<input class="' + this.inputClass + '" type="number" min="0">')
				input
					.val(this.controlledValue())
					.change( () => {
						this.controlledValue(Number( input.val() ))
						$('.' + this.inputClass).val(this.controlledValue()) })
					.appendTo(this.div)
			}

			this.lines = this.div.find('line')
			this.setupLines(this.lines)

			this.div
				.on('mlayout', this.layout.bind(this))
				.appendTo(parent)
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
			stopProp(e)
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
		getTop: mrow => g.printerMargin() + mrow * (g.imageHeight() + g.imageMargin()),
		getHeight: () => g.imageHeight()
	})
	const verticalMarginMeasureProto = Object.create(verticalMeasureProto).configure({
		inputClass: 'imageMarginInp',
		controlledValue: g.imageMargin,
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

	//add printer margin measures
	{
		Object.create(horizontalMeasureProto).configure({
			inputClass: 'printerMarginInp',
			controlledValue: g.printerMargin,
			getLeft: () => 0,
			getWidth: () => g.printerMargin()
		}).init(-1)
		Object.create(horizontalMeasureProto).configure({
			inputClass: 'printerMarginInp',
			controlledValue: g.printerMargin,
			getLeft: () => g.paperWidth() - g.printerMargin(),
			getWidth: () => g.printerMargin()
		}).init(-1)
		Object.create(verticalMeasureProto).configure({
			inputClass: 'printerMarginInp',
			controlledValue: g.printerMargin,
			getTop: () => 0,
			getHeight: () => g.printerMargin()
		}).init(-1)
		Object.create(verticalMeasureProto).configure({
			inputClass: 'printerMarginInp',
			controlledValue: g.printerMargin,
			getTop: () => g.paperHeight() - g.printerMargin(),
			getHeight: () => g.printerMargin()
		}).init(-1)
	}

	//add page measures
	{
		Object.create(horizontalMeasureProto).configure({
			inputClass: 'paperWidthInp',
			controlledValue: g.paperWidth,
			getLeft: () => 0,
			getWidth: () => g.paperWidth()
		}).init(-1, bottomSide)
		Object.create(verticalMeasureProto).configure({
			inputClass: 'paperHeightInp',
			controlledValue: g.paperHeight,
			getTop: () => 0,
			getHeight: () => g.paperHeight()
		}).init(-1, rightSide)
		//these are flipped by css to have lines at the paper and input outside
	}

	g.on_paperWidth_changed(layoutBoxesAndMeasures)
	g.on_paperHeight_changed(layoutBoxesAndMeasures)

	g.on_printerMargin_changed(layoutBoxesAndMeasures)
	g.on_imageMargin_changed(layoutBoxesAndMeasures)
}
