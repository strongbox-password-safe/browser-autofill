const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");


const sourcePath = path.join(__dirname, 'src');
const destPath = path.join(__dirname, 'dist');
const targetBrowser = process.env.TARGET_BROWSER;

const prod = process.env.NODE_ENV === 'production';

module.exports = {
  mode: prod ? 'production' : 'development',
  entry: {
    background: path.join(sourcePath, 'Background', 'background.ts'),
    content: path.join(sourcePath, 'Content', 'content.ts'),
    
    popup: path.join(sourcePath, 'Popup', 'popup.tsx'),
    
    
  },
  output: {
    path: path.join(destPath, targetBrowser),
    filename: 'js/[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        resolve: {
          extensions: ['.ts', '.tsx', '.js', '.json'],
        },
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: [{ loader: MiniCssExtractPlugin.loader }, 'css-loader'],
      },
    ],
  },
  devtool: prod ? undefined : 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(sourcePath, 'Popup', 'popup.html'),
      inject: 'body',
      chunks: ['popup'],
      hash: true,
      filename: 'popup.html',
    }),
    new webpack.DefinePlugin({
      'process.env.VERSION': JSON.stringify(
        process.env.npm_package_version,
      ),
    }),
    new MiniCssExtractPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: 'src/assets', to: 'assets' }],
    }),
    
    
    
    new CopyWebpackPlugin({
      patterns: [
        {
          from: `src/manifest.${targetBrowser}.json`,
          to: './manifest.json',
        },
      ],
    }),
  ],
  optimization: {
    minimize: prod,
    minimizer: [new TerserPlugin({
      terserOptions: {
        format: {
          comments: false,
        },
        compress: {
          drop_console: true
        }
      },
      extractComments: false,
    })],
  },
  stats: {
    all: false,
    builtAt: true,
    errors: true,
    hash: true,
  },
};
