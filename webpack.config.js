const path = require('path')
const { BannerPlugin } = require('webpack')
const externals = require('webpack-node-externals')

const config = {
  context: path.join(__dirname, './src'),
  entry: './index.js',
  output: {
    path: path.join(__dirname, './dist'),
    libraryTarget: 'commonjs2',
    filename: 'difflint.js',
    sourceMapFilename: 'difflint.js.map',
  },
  devtool: 'source-map',
  target: 'node',
  externals: [externals()],
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new BannerPlugin('#!/usr/bin/env node'),
  ]
}

module.exports = config
