import { Observable } from "tns-core-modules/data/observable";
import { GoogleLogin } from 'nativescript-google-login';
import * as application from "tns-core-modules/application";
import { isIOS } from "tns-core-modules/platform/platform";

export class HomeViewModel extends Observable {
    constructor() {
        super();
        if (isIOS) {
            GoogleLogin.init({
                google: {
                    initialize: true,
                    serverClientId: "<YOUR_GOOGLE_SERVER_ID>",
                    clientId: "<YOUR_GOOGLE_CLIENT_ID>",
                    isRequestAuthCode: true
                },
                viewController: application.ios.rootController
            });
        } else {
            GoogleLogin.init({
                google: {
                    initialize: true,
                    serverClientId: "<YOUR_GOOGLE_SERVER_ID>",
                    clientId: "<YOUR_GOOGLE_CLIENT_ID>",
                    isRequestAuthCode: true
                },
                activity: application.android.foregroundActivity
            });
        }
    }

    login() {
        GoogleLogin.login();
    }
}
