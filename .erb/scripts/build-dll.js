/**
 * Builds the DLL for development electron renderer process
 */

import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import baseConfig from '../configs/webpack.config.base';
import webpackPaths from '../configs/webpack.paths';
import { dependencies } from '../../package.json';
import checkNodeEnv from './check-node-env';

checkNodeEnv('development');

const dist = webpackPaths.dllPath;

const configuration = merge(baseConfig, {
  context: webpackPaths.rootPath,
  devtool: 'eval',
  mode: 'development',
  target: 'electron-renderer',
  externals: ['fsevents', 'crypto-browserify'],
  
  /**
   * Use `module` from `webpack.config.renderer.dev.js`
   */
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },

  entry: {
    renderer: Object.keys(dependencies || {}),
  },

  output: {
    path: dist,
    filename: '[name].dev.dll.js',
    library: {
      name: 'renderer',
      type: 'var',
    },
  },

  plugins: [
    new webpack.DllPlugin({
      path: path.join(dist, '[name].json'),
      name: '[name]',
    }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: webpackPaths.srcPath,
      },
    }),
  ],
});

export default configuration;

if (require.main === module) {
  webpack(configuration).run((err, stats) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(stats.toString());
  });
} 