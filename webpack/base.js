import path from 'path';

import { aliasItems, devServerUrl, externalItems } from './config';
import entry from './entry';
import optimization from './optimization';
import * as plugins from './plugins';
import * as rules from './rules';
import { isDevServer, isProd } from './utils/env';
import { arrayFilterEmpty } from './utils/helpers';

export default {
  context: __dirname,
  target: isDevServer ? 'web' : ['web', 'es5'],
  mode: isProd ? 'production' : 'development',
  entry,
  output: {
    path: path.join(__dirname, '../dist'),
    publicPath: isDevServer ? devServerUrl : './',
    filename: isDevServer ? '[name].123.[fullhash].js?ver=1.02' : '[name].js?ver=1.02',
  },
  module: {
    rules: arrayFilterEmpty([
      rules.javascriptRule,
      rules.typescriptRule,
      rules.htmlRule,
      rules.imagesRule,
      rules.fontsRule,
      rules.cssRule,
      rules.textRule,
      ...rules.lessRules,
      ...rules.sassRules,
      ...rules.svgRules,
    ]),
  },
  plugins: arrayFilterEmpty([
    plugins.dotEnvPlugin,
    plugins.htmlWebpackPlugin,
    plugins.providePlugin,
    plugins.definePlugin,
    plugins.forkTsCheckerWebpackPlugin,
    plugins.esLintPlugin,
    plugins.copyPlugin,
  ]),
  resolve: {
    alias: aliasItems,
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  optimization,
  externals: externalItems,
};
