const path = require('path')

module.exports =  {
	entry: './js/main.js',
	output: {
		path: path.join(__dirname, 'docs'),
		filename: 'bundle.js'
	},
	watchOptions: {
		ignored: /node_modules/,
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['env']
					}
				}
			}
		]
	}
}
