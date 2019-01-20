const path = require('path');
const webpack = require('webpack');


const isDev = process.env.NODE_ENV !== 'production';

const config = module.exports = {
  entry: {
    index: './src/index.js'
  },
  externals: { /* TODO: clean this up by not having a dual browser/node module */
    fs: true,
    mime: true
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: 'build/',
    libraryTarget: "var",
    library: "ReactTask"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        use: [
          {loader: 'babel-loader', options: {babelrc: true}}
        ]
      },
      {
        test: /\.css$/,
        use: [
          {loader: 'style-loader', options: {sourceMap: isDev}},
          {loader: 'css-loader', options: {modules: false}},
        ]
      },
      {
        test: /\.(eot|svg|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[ext]',
              publicPath: 'build/'
            }
          }
        ]
      },
      {
        test: /\.(ico|gif|png|jpg|jpeg|svg)$/,
        use: [
          {loader: 'file-loader', options: {name: 'images/[name].[ext]'}}
        ]
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
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor.js",
      minChunks: function (module) { return /node_modules/.test(module.resource); }
    })
  ],
  resolve: {
    extensions: ['.js']
  }
};

if (isDev) {
  config.devtool = 'inline-source-map';
} else {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }));
}
