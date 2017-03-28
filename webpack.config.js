const path = require('path')

module.exports =  {
	entry: './js/main.js',
	output: {
		path: path.join(__dirname, 'docs'),
		filename: 'bundle.js'
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
	},
	devServer: {
		contentBase: 'docs',
		stats: 'errors-only',
	}
}
