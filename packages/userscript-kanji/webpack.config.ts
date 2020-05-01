import { Configuration } from 'webpack';
import WebpackUserscript from 'webpack-userscript';

const config: Configuration = {
   entry: './src/index.ts',
   module: {
      rules: [
         {
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
         },
         {
            test: /\.scss$/,
            use: ['to-string-loader', 'css-loader', 'sass-loader'],
         },
      ],
   },
   resolve: {
      extensions: ['.ts', '.js', '.scss'],
   },
   plugins: [
      new WebpackUserscript({
         headers: {
            name: 'Jisho2Anki',
            namespace: 'http://tampermonkey.net/',
            version: '[version]',
            description: 'Add vocabulary and kanji from jisho to Anki with AnkiConnect plugin',
            author: '[author]',
            match: 'https://jisho.org/search/*',
            grant: ['GM_addStyle'],
         },
      }),
   ],
};

export default config;
