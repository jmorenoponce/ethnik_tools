import path	from "path";
import webpack from "webpack";

export default {
	mode: 'development',
	entry: {index: path.resolve("src/js", "main.js")},
	output: {
		path: path.resolve('public/js'),
		filename: 'main.bundle.js',
	},
	plugins: [
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery'
		})
	],
	// resolve: {
	// 	alias: {
	// 		handlebars: 'handlebars/dist/handlebars.min.js'
	// 	}
	// }
};
