import varstore from './varstore.js'

const pub = varstore({
	paperWidth: 210, //mm
	paperHeight: 297, //mm

	printerMargin: 10, //mm
	imageMargin: 5, //mm

	columns: 0,
	rows: 0
})

//calculated
let _printWidth = 0 //mm
let _printHeight = 0 //mm

let _imageWidth = 0 //mm
let _imageHeight = 0 //mm

function calcImageWidth(){
	_printWidth = pub.paperWidth() - 2 * pub.printerMargin()
	_imageWidth = (_printWidth - (pub.columns() - 1) * pub.imageMargin()) / pub.columns()
}
function calcImageHeight(){
	_printHeight = pub.paperHeight() - 2 * pub.printerMargin()
	_imageHeight = (_printHeight - (pub.rows() - 1) * pub.imageMargin()) / pub.rows()
}
function calcImageWidthHeight(){
	calcImageWidth()
	calcImageHeight()
}

pub.on_paperWidth_changed(calcImageWidth)
pub.on_paperHeight_changed(calcImageHeight)

pub.on_printerMargin_changed(calcImageWidthHeight)
pub.on_imageMargin_changed(calcImageWidthHeight)

pub.on_columns_changed(calcImageWidth)
pub.on_rows_changed(calcImageHeight)

pub.printWidth = () => _printWidth
pub.printHeight = () => _printHeight
pub.imageWidth = () => _imageWidth
pub.imageHeight = () => _imageHeight

let _preColumnsChange
const _columnsFunc = pub.columns
pub.columns = function(v) {
	if(typeof v === 'undefined'){
		return _columnsFunc()
	}else{
		_preColumnsChange(pub.columns(), v)
		_columnsFunc(v)
	}
}
pub.preColumnsChange = (func) => {_preColumnsChange = func}

let _preRowsChange
const _rowsFunc = pub.rows
pub.rows = function(v) {
	if(typeof v === 'undefined'){
		return _rowsFunc()
	}else{
		_preRowsChange(pub.rows(), v)
		_rowsFunc(v)
	}
}
pub.preRowsChange = (func) => {_preRowsChange = func}

export default pub
