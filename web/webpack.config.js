const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

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
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.opt\.svg$/,
        use: ["@svgr/webpack", "svg-inline-loader"]
      },
      {
        test: /\.mp3$/,
        use: ["file-loader"]
      }
    ]
  },
  plugins: [
    // new CleanWebpackPlugin(),
    new HtmlWebPackPlugin({
      template: "./public/index.html",
      filename: "./index.html",
      favicon: "./public/favicon.png"
    }),
    new CopyPlugin([
      {from: "./public/robots.txt", to: "robots.txt"}
    ])
  ],
  output: {
    publicPath: "/static/"
  },
  devtool: '',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 9076,
    writeToDisk: true
  }
};
