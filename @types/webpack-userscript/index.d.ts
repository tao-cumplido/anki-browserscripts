import { Plugin } from 'webpack';

export type HeaderObject = Record<string, string | string[]>;

export interface DataObject {
   hash: string;
   chunkHash: string;
   chunkName: string;
   file: string;
   filename: string;
   basename: string;
   query: string;
   buildNo: number;
   buildTime: number;
   name: string;
   version: string;
   description: string;
   author: string;
   homepage: string;
   bugs: string;
}

export type HeaderProvider = (data: DataObject) => HeaderObject;

export interface ProxyScriptOptions {
   enable?: boolean | (() => boolean);
   fileName?: string;
   baseUrl?: string;
}

export type StringFilter = string | RegExp | Array<string | RegExp>;

export interface SsriOptions {
   include?: StringFilter;
   exclude?: StringFilter;
   algorithms?: Array<'sha256' | 'sha384' | 'sha512'>;
   integrity?: string;
   size?: number;
}

export interface WebpackUserscriptOptions {
   headers?: HeaderObject | HeaderProvider | string;
   pretty?: boolean;
   metjas?: boolean;
   renameExt?: boolean;
   proxyScript?: ProxyScriptOptions;
   downloadBaseUrl?: string;
   updateBaseUrl?: string;
   ssri?: boolean | SsriOptions;
}

export default class WebpackUserscript extends Plugin {
   constructor(options?: WebpackUserscriptOptions | HeaderProvider | string);
}
