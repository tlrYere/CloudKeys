// webpack.config.js used to load credentials in the browser
const webpack = require('webpack')
const path = require('path')
const {defaultProvider} = require('@aws-sdk/credential-provider-node')

module.exports = (async () => ({
	entry: 'browser-script.js',
	output: {
		path: path.resolve(__dirname),
		filename: 'browser-script-bundle.js',
		library: 'test'
	},
	module: {
		rules: {
			test: /browser-script.js/,
		},
		use: [
			{
				loader: 'json'
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			credentials: JSON.stringify(await defaultProvider()())
		})
	]
}))()