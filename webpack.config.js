require('dotenv').config();
const EnvSettings = require('./node_modules/advanced-settings').EnvSettings;
const envSettings = new EnvSettings();
const Webpack = require('webpack');
const Path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');

const opts = {
  rootDir: process.cwd(),
  devBuild: process.env.NODE_ENV !== 'production',
};

module.exports = {
  entry: {
    app: './src/js/app.js',
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool:
    process.env.NODE_ENV === 'production' ? 'source-map' : 'inline-source-map',
  output: {
    path: Path.join(opts.rootDir, 'dist'),
    pathinfo: opts.devBuild,
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
  },
  performance: { hints: false },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 5,
        },
      }),
      new CssMinimizerPlugin({}),
    ],
    runtimeChunk: false,
  },
  plugins: [
    // Extract css files to seperate bundle
    new MiniCssExtractPlugin({
      filename: 'css/app.css',
      chunkFilename: 'css/app.css',
    }),
    // Copy fonts and images to dist
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/fonts', to: 'fonts' },
        { from: 'src/img', to: 'img' },
      ],
    }),
    // Copy dist folder to static
    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [{ source: './dist/', destination: './static' }],
        },
      },
    }),
  ],
  module: {
    rules: [
      // Babel-loader
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      // Css-loader & sass-loader
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require.resolve('sass'),
            },
          },
        ],
      },
      // html loader
      {
        test: /\.html$/i,
        loader: 'raw-loader',
      },
      // Load fonts
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
      // Load images
      {
        test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name][ext]',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.scss'],
    modules: ['node_modules'],
    alias: {
      request$: 'xhr',
    },
  },
  devServer: {
    onBeforeSetupMiddleware: (devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      devServer.app.get('/oauth2/ping', function (_req, res) {
        console.log('ping');
        res.json({ message: 'done' });
      });

      devServer.app.get('/settings.json', function (_req, res) {
        const settings = envSettings.loadJsonFileSync('./settings-dev.json');
        res.json(settings);
      });

      devServer.app.post('/oauth2/token/refresh', function (_req, res) {
        return res.json({
          message: 'New token generated',
          code: 200001,
          content: {
            accessToken: 'somenewtoken',
          },
        });
      });
    },
    static: {
      directory: Path.join(__dirname, 'static'),
    },
    compress: true,
    port: 8080,
    open: true,
  },
};
