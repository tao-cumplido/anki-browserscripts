import path from 'path';
import url from 'url';

import 'dotenv/config';
import { readFileSync } from 'fs-extra';
import { JSDOM } from 'jsdom';
import { fs as memfs } from 'memfs';
import webpack, { loader, Configuration, DefinePlugin, Stats } from 'webpack';
import WebpackUserscript from 'webpack-userscript';

const production = process.env['NODE_ENV'] === 'production';
const mode = production ? 'production' : 'development';
const devtool = production ? false : 'eval-source-map';
const tsConfig = 'tsconfig.app.json';

const define = new DefinePlugin({
   PRODUCTION: production,
});

function isResourceModule(module: unknown): module is { resource: string } {
   if (typeof module !== 'object' || !module) {
      return false;
   }
   return typeof (module as Record<string, unknown>).resource === 'string';
}

const config: Configuration = {
   mode,
   entry: './src/index.ts',
   module: {
      rules: [
         {
            test: /\.ts$/,
            use: [
               {
                  loader: 'babel-loader',
                  options: {
                     presets: [['@babel/preset-env', { modules: false }]],
                     plugins: ['@babel/plugin-proposal-unicode-property-regex'],
                  },
               },
               {
                  loader: 'ts-loader',
                  options: {
                     configFile: tsConfig,
                  },
               },
            ],
            exclude: /node_modules/,
         },
         {
            test: /\.scss$/,
            use: ['to-string-loader', 'css-loader', 'sass-loader'],
         },
         {
            test: /\.html$/,
            loader: 'html-loader',
            options: {
               preprocessor: async (content: string, context: loader.LoaderContext) => {
                  const {
                     window: { document },
                  } = new JSDOM(content);

                  for (const script of document.querySelectorAll('script')) {
                     if (!script.src) {
                        continue;
                     }

                     const sourcePath = path.join(context.context, script.src);
                     const targetPath = `${path.parse(sourcePath).name}.js`;

                     const compiler = webpack({
                        mode,
                        entry: sourcePath,
                        output: {
                           path: __dirname,
                           filename: targetPath,
                        },
                        module: {
                           rules: [
                              {
                                 test: /\.ts$/,
                                 use: [
                                    {
                                       loader: 'babel-loader',
                                       options: {
                                          presets: [['@babel/preset-env', { targets: 'Chrome >= 77', modules: false }]],
                                          plugins: ['@babel/plugin-proposal-unicode-property-regex'],
                                       },
                                    },
                                    {
                                       loader: 'ts-loader',
                                       options: {
                                          configFile: tsConfig,
                                       },
                                    },
                                 ],
                                 exclude: /node_modules/,
                              },
                           ],
                        },
                        resolve: {
                           extensions: ['.ts', '.js'],
                        },
                        devtool,
                        plugins: [define],
                     });

                     compiler.outputFileSystem = {
                        join: path.join.bind(path),
                        mkdir: memfs.mkdir.bind(memfs),
                        mkdirp: memfs.mkdirp.bind(memfs),
                        rmdir: memfs.rmdir.bind(memfs),
                        unlink: memfs.unlink.bind(memfs),
                        writeFile: memfs.writeFile.bind(memfs),
                     };

                     const { compilation } = await new Promise<Stats>((resolve, reject) =>
                        compiler.run((error: Error | null, stats) => (error ? reject(error) : resolve(stats))),
                     );

                     for (const module of compilation.modules) {
                        if (isResourceModule(module)) {
                           context.addDependency(module.resource);
                        }
                     }

                     script.removeAttribute('src');

                     const code = memfs.readFileSync(targetPath, 'utf-8') as string;

                     script.textContent = `\n${code.replace(/"\{\{(.+?)\}\}"/gm, '`{{$1}}`')}\n`;

                     if (!production) {
                        script.textContent = `${script.textContent}//# sourceURL=${targetPath}\n`;
                     }
                  }

                  return document.body.innerHTML;
               },
               minimize: false,
            },
         },
      ],
   },
   resolve: {
      extensions: ['.ts', '.js', '.scss'],
   },
   devtool,
   devServer: {
      contentBase: path.join(__dirname, 'dist'),
      clientLogLevel: 'error',
      writeToDisk: true,
      disableHostCheck: true,
      https: {
         key: readFileSync(process.env['LOCALHOST_KEY'] ?? ''),
         cert: readFileSync(process.env['LOCALHOST_CERT'] ?? ''),
         ca: readFileSync(process.env['LOCALHOST_ROOTCA'] ?? ''),
      },
   },
   plugins: [
      define,
      new WebpackUserscript({
         headers: {
            name: 'kanji2anki',
            version: production ? '[version]' : '[version]-build.[buildNo]',
            description: 'Add kanji from online dictionaries to anki',
            author: '[author]',
            match: 'https://www.sanseido.biz/User/Dic/*',
            grant: ['GM_addStyle'],
         },
         proxyScript: {
            baseUrl: url.pathToFileURL(path.join(__dirname, 'dist')).href,
            filename: '[basename].proxy.user.js',
            enable: !production,
         },
      }),
   ],
};

export default config;
