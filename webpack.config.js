const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/components/index.tsx',
	target: 'web',
	mode: process.env.NODE_ENV || 'development',
	output: {
		path: path.resolve(__dirname, 'build', 'public'),
		filename: 'bundle.js'
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.json', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, 'src', 'index.html'),
		}),
	],
	devServer: {
		proxy: {
			'/': 'http://localhost/'
		},
		compress: true,
		hot: true,
		liveReload: true,
	},
};
