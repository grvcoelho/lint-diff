const path = require('path')

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
  mode: 'production',
}

module.exports = config
