const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const StartServerPlugin = require('start-server-webpack-plugin');
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  target: 'node',
  node: {
    __filename: true,
    __dirname: true
  },
  mode: isProd ? 'production' : 'development',
  entry: [isProd ? null : 'webpack/hot/poll?300', './src/index.ts'].filter(
    (x) => x
  ),
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {}
          }
        ]
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'remote-client.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  watch: !isProd,
  plugins: isProd
    ? []
    : [
        new webpack.HotModuleReplacementPlugin(),
        new StartServerPlugin({
          name: 'remote-client.js',
          keyboard: true
        })
      ],
  externals: [
    nodeExternals({
      whitelist: [isProd ? null : 'webpack/hot/poll?300'].filter((x) => x)
    })
  ]
};
