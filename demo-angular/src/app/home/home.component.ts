import { Component, OnInit } from "@angular/core";
import { GoogleLogin } from 'nativescript-google-login';

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {

    constructor() {
        // Use the component constructor to inject providers.
    }

    ngOnInit(): void {
        // Init your component properties here.
        GoogleLogin.init({
            google: {
                initialize: true,
                serverClientId: "",
                clientId: "",
                isRequestAuthCode: true
            }
        });
    }

    login(): void {
        // GoogleSignin.init();
        // GoogleSignin.loginWithGoogle((result)=>{
        //     console.dir(result);
        // });
        GoogleLogin.login(result=>{
            console.dir(result);
        });

    }
}
