const path = require('path');


const HtmlWebpackPlugin = require('html-webpack-plugin'); // Generate index.html with built JS
const TerserPlugin = require("terser-webpack-plugin");  // Mangle JS for Production.


module.exports = (env, argv) => {
  const isProductionBuild = env.WEBPACK_SERVE ? false : true
  // const isProductionBuild = true

  console.info("Running production build? ", isProductionBuild)
  return {
    entry: './main.js',
    mode: isProductionBuild ? 'production' : 'development' ,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'entry-point.js',
      publicPath: '', // Avoid a leading / being added to paths.
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'static'),
      },
      compress: true,
      port: 9000,
    },
    resolve: {
      alias: {
        "@game": path.resolve(__dirname, "game"),
        "@core": path.resolve(__dirname, "core-js/src")
      },
    },
    plugins: [new HtmlWebpackPlugin()],
    optimization: {
      minimize: isProductionBuild,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            mangle: {
              keep_fnames: false, // Disable keeping original function names
              keep_classnames: false, // Disable keeping original class names
              properties: {
                keep_quoted: true
              }, 
            }
          }
        })
      ]
    },
  }
}