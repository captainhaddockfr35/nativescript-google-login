import { Component, OnInit } from "@angular/core";
import { Application, isIOS } from "@nativescript/core";
import { GoogleLogin } from "../../../src";

@Component({
    selector: "ns-app",
    templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {
    ngOnInit(): void {
        // Init your component properties here.

            if (isIOS) {
                GoogleLogin.init({
                    google: {
                        initialize: true,
                        serverClientId: "<YOUR_GOOGLE_SERVER_ID>",
                        clientId: "<YOUR_GOOGLE_CLIENT_ID>",
                        isRequestAuthCode: true
                    },
                    viewController: Application.ios.rootController
                });
            } else {
                GoogleLogin.init({
                    google: {
                        initialize: true,
                        serverClientId: "<YOUR_GOOGLE_SERVER_ID>",
                        clientId: "<YOUR_GOOGLE_CLIENT_ID>",
                        isRequestAuthCode: true
                    },
                    activity: Application.android.foregroundActivity
                });
            }
        
    }

    login(): void {
        GoogleLogin.login(result => {
            console.dir(result);
        });
    }

    logout(): void {
        GoogleLogin.logout(() => {
            console.log("LOGOUT DONE");
        });
    }
}
