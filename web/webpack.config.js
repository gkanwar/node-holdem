const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: {
          loader: "html-loader"
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.opt\.svg$/,
        use: ["@svgr/webpack", "url-loader"]
      }
    ]
  },
  plugins: [
    // new CleanWebpackPlugin(),
    new HtmlWebPackPlugin({
      template: "./public/index.html",
      filename: "./index.html",
      favicon: "./public/favicon.ico"
    })
  ],
  output: {
    publicPath: "/static/"
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 9075,
    writeToDisk: true
  }
};
