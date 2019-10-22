import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { GoogleLogin } from 'nativescript-google-login';
import * as application from "tns-core-modules/application";
import { ios as iosApp } from "tns-core-modules/application";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout/grid-layout";
import { isIOS } from "tns-core-modules/platform/platform";


@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {

    @ViewChild('page', {static: false}) viewPage : ElementRef<GridLayout>;

    constructor() {
        // Use the component constructor to inject providers.
    }

    ngOnInit(): void {
        // Init your component properties here.

        if(isIOS){
            setTimeout(()=>{
                GoogleLogin.init({
                    google: {
                        initialize: true,
                        serverClientId: "",
                        clientId: "",
                        isRequestAuthCode: true
                    },
                    viewController: application.ios.rootController
                });
            }, 900)
            
    
        } else {
            GoogleLogin.init({
                google: {
                    initialize: true,
                    serverClientId: "",
                    clientId: "",
                    isRequestAuthCode: true
                },
                activity: application.android.foregroundActivity
            });
        }
        
        
    }

    login(): void {
        GoogleLogin.login(result=>{
            console.dir(result);
        });

    }
}
