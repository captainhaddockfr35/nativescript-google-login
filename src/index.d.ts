import { Common, ILoginResult, ILoginConfiguration } from './nativescript-google-login';

export declare class GoogleLogin extends Common {
  // define your typings manually
  // or..
  // take the ios or android .d.ts files and copy/paste them here
  static login(callback: (result: ILoginResult) => void);
  static logout(callback: () => void);
  static init(config: ILoginConfiguration): ILoginConfiguration;
}


// Export neccessary Interfaces
export {
  LoginResultType,
  ILogger,
  ILoginConfiguration,
  IInitializationResult,
  ILoginResult
} from "./nativescript-google-login.common";