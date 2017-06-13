'Use strict';
var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var fs = require('fs');
var webpack = require("webpack");

var NODE_ENV = process.env.NODE_ENV || "dev";

var nodeModules = {};
fs.readdirSync('node_modules')
	.filter(function(x) {
		return ['.bin'].indexOf(x) === -1;
	})
	.forEach(function(mod) {
		nodeModules[mod] = 'commonjs ' + mod;
	});

const createPreviewEntry = () => {
	const host = getParam("host") || 'localhost';
	const port = getParam("port") || 8080;
	const address = `${host}:${port}`;


	const entry = createClientEntry('preview', [`webpack-dev-server/client?http://${address}/`, "webpack/hot/dev-server", './src/entries/preview'], false, `http://${address}`, true);
	entry.devServer = {
		host: host,
		port: port,
		hot: true,
		contentBase: path.resolve(__dirname, './public')
	};
	entry.plugins.push(new webpack.HotModuleReplacementPlugin());

	const testModule = getParam("file");
	if (!!testModule) {
		console.info("Start testing module: " + testModule);
		entry.plugins.push(new webpack.NormalModuleReplacementPlugin(/\/fakeTestModule\.tsx/, testModule));
	} else {
		console.warn("No module was specified for preview.");
	}
	
	return entry;
};

module.exports = createPreviewEntry();

function getParam(name) {
	for (let i = 0; i < process.argv.length; i++) {
		if (process.argv[i].indexOf(`--${name}=`) == 0) {
			return process.argv[i].substring(process.argv[i].indexOf("=") + 1);
		}
	}
	return null;
}

function createClientEntry(name, entryPath, noEmitFiles, publicPath) {
	var entry = createCommonEntry(name, entryPath, noEmitFiles, publicPath);
	entry.devtool = 'inline-source-map';
	return entry;
}

function createCommonEntry(name, entryPath, noEmitFiles, publicPath, disableExtractText) {
	let entry = {};
	entry[name] = entryPath;

	return {
		context: path.resolve(__dirname, '.'),
		entry: entry,
		output: {
			filename: '[name].js',
			path: path.resolve(__dirname, './public/bld'),
			publicPath: (!!publicPath ? publicPath : "") + "/bld/"
		},
		resolve: {
			extensions: ["", ".js", ".jsx", ".ts", ".tsx"],
			root: [
				path.resolve(__dirname, '.'),
			],
			alias: {
				"encaps-component-factory": path.resolve(__dirname, '../dist/index'),
				"encaps-component-factory-redux": path.resolve(__dirname, '../redux/dist/index'),
			}
		},
		module: {
			loaders: [
				{
					test: /\.tsx?$/,
					exclude: /node_modules/,
					loader: 'ts'
				},
				{
					test: /\.json$/,
					loader: 'json'
				},
				{
					test: /\.css$/,
					loader: noEmitFiles ? 'css-loader/locals?&modules&localIdentName=[path][name]__[local]'
						: ExtractTextPlugin.extract('style-loader', 'css?modules&localIdentName=[path][name]__[local]')
				},
				{
					test: /\.less$/,
					loader: noEmitFiles ? 'css-loader/locals?&modules&localIdentName=[path][name]__[local]!less'
						: ExtractTextPlugin.extract('style-loader', 'css?modules&localIdentName=[path][name]__[local]!less')
				},
				{
					test: /\.(svg|png|jpg)$/,
					loader: 'url?' + (noEmitFiles ? 'emitFile=false&' : '') + 'limit=1000&name=[path][name].[ext]?[hash]'
				}
			]
		},
		plugins: [
			new ExtractTextPlugin("styles.css", {disable: true})
		]
	};
}