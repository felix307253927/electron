/**
 * @author Created by felix on 17-8-30.
 * @email   307253927@qq.com
 */
'use strict';

var path               = require('path');
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
var UglifyJsPlugin     = require('webpack/lib/optimize/UglifyJsPlugin');
var DefinePlugin       = require('webpack/lib/DefinePlugin')
var CopyWebpackPlugin  = require('copy-webpack-plugin');
var HtmlWebpackPlugin  = require('html-webpack-plugin')
var ExtractTextPlugin  = require('extract-text-webpack-plugin')
var fs                 = require("fs");
var appDirectory       = fs.realpathSync(process.cwd());

function resolveApp(relativePath) {
  return path.resolve(appDirectory, relativePath);
}

var isDev = process.env.NODE_ENV !== "production"

var config     = {
  target      : "electron-renderer",
  watch       : true,
  watchOptions: {
    ignored: [/node_modules/, /opus/, /dist/, /app/, 'src/resources/**/*'],
  },
  entry       : {
    main  : ['./src/index.js'],
    vendor: './src/vendor.js'
  },
  output      : {
    path             : resolveApp('app'),
    filename         : 'js/[name].js',
    chunkFilename    : 'js/[name].js',
    sourceMapFilename: 'js/[name].map'
  },
  devtool     : 'source-map',
  resolve     : {
    alias  : {
      'vue': 'vue/dist/vue.min.js' //解决 import vue from  指向的是dist/vue.common.js 而不是我们想要的dist/vue.js
    },
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ]
  },
  module      : {
    rules: [
      {
        test  : /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test   : /\.js$/,
        loader : 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        //'style', 'css?importLoaders=1&-autoprefixer!postcss'
        use : ExtractTextPlugin.extract({
          fallback: "style-loader",
          use     : "css-loader",
        })
      },
      {
        test   : /\.scss$/,
        exclude: /node_modules/,
        use    : ExtractTextPlugin.extract({
          fallback: "style-loader",
          use     : ["css-loader", "sass-loader"],
        }),
      },
      {
        test  : /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        loader: 'file-loader'
      },
      {
        test  : /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
        loader: 'file-loader',
        query : {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  plugins     : [
    new CommonsChunkPlugin({
      name: ["main", 'vendor']
    }),
    new ExtractTextPlugin('css/[name].css'),
    new HtmlWebpackPlugin({
      template      : 'src/index.html',
      // chunks        : ['main', 'vendor'],
      chunksSortMode: 'dependency'
    }),
    new DefinePlugin({
      'process.env': {
        URL: JSON.stringify(isDev ? 'localhost:19985' : '')
      }
    }),
    new CopyWebpackPlugin([
      {context: 'src', from: '*.html', to: ''},
      {context: 'src', from: 'resources/**/*', to: ''},
      {context: 'src', from: 'main/**/*', to: ''},
      {context: 'src', from: 'js/opus_encoder.js', to: 'js'},
      {context: 'src', from: 'preload.js', to: ''},
    ], {
      ignore        : [],
      copyUnmodified: true
    }),
    /*new UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),*/
  ]
}
module.exports = config
