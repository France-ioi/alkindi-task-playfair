
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const config = module.exports = {
  entry: {
    index: './src/index.js'
  },
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: 'build/',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'babel-loader',
        query: {
          babelrc: true
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(eot|svg|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
        loader: 'file-loader?name=fonts/[name].[ext]',
        options: {
          publicPath: 'build/'
        }
      },
      {
        test: /\.(ico|gif|png|jpg|jpeg|svg)$/,
        loader: 'file-loader?context=public&name=images/[name].[ext]'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.CommonsChunkPlugin({name: "vendor", filename: "vendor.js"})
  ]
};

if (process.env.NODE_ENV !== 'production') {
  config.devtool = 'inline-source-map';
} else {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }));
}
