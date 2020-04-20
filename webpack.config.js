// webpack.config.js used to load credentials in the browser
const webpack = require('webpack')
const path = require('path')
const {defaultProvider} = require('@aws-sdk/credential-provider-node')

module.exports = {
	entry: './src/browser-script.js',
	output: {
		path: path.resolve(__dirname),
		filename: 'browser-script-bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.json$/,
				loaders: ['json']
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			credentials: JSON.stringify(await defaultProvider()())
		})
	]
}