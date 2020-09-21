import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { GoogleLogin } from "nativescript-google-login";
import * as application from "tns-core-modules/application";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout/grid-layout";
import { isIOS } from "tns-core-modules/platform/platform";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {
    @ViewChild("page", { static: false }) viewPage: ElementRef<GridLayout>;

    constructor() {
        // Use the component constructor to inject providers.
    }

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
