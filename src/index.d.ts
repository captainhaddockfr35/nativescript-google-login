import { Common, ILoginResult, ILoginConfiguration } from './nativescript-google-signin.common';

export declare class GoogleSignin extends Common {
  // define your typings manually
  // or..
  // take the ios or android .d.ts files and copy/paste them here
  static login(callback: (result: ILoginResult) => void);
  static init(config: ILoginConfiguration): ILoginConfiguration;
}


// Export neccessary Interfaces
export {
  LoginResultType,
  ILogger,
  ILoginConfiguration,
  IInitializationResult,
  ILoginResult
} from "./nativescript-google-signin.common";