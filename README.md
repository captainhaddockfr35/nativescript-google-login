# Nativescript Google Login

[![npm version](https://badge.fury.io/js/nativescript-google-login.svg)](http://badge.fury.io/js/nativescript-google-login)
[![NPM](https://nodei.co/npm/nativescript-google-login.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/nativescript-google-login/)

Add Google SignIn to your Nativescript Application. This plugin provides an AuthCode for server-side authentication

It is inspired by the plugin [nativescript-social-login](https://github.com/mkloubert/nativescript-social-login)

Works with Android X, iOS 13

## Screenshots
### Android
![Screenshot of Android](https://raw.githubusercontent.com/pboulch/nativescript-google-login/master/docs/screenshot-android.png)

### iOS
![Screenshot of Android](https://raw.githubusercontent.com/pboulch/nativescript-google-login/master/docs/screenshot-ios.png)

## Dependencies

### iOS

```
pod 'GoogleSignIn', '~> 5.0'
```

### Android

```
implementation 'com.google.android.gms:play-services-auth:17.0.0'
```

## Installation

```javascript
tns plugin add nativescript-google-login
```

### iOS

#### Get an OAuth client ID
Get an Oauth client id from the [Google website](https://developers.google.com/identity/sign-in/ios/start-integrating#get_an_oauth_client_id)

#### Info.plist

Add the following to your Info.plist file located in app/App_Resources/iOS

```
<key>CFBundleURLTypes</key>
<array>
	<dict>
		<key>CFBundleTypeRole</key>
		<string>Editor</string>
		<key>CFBundleURLSchemes</key>
		<array>
			<string>com.googleusercontent.apps.123123123-172648sdfsd76f8s7d6f8sd</string>
			<!-- It shoud look like this: com.googleusercontent.apps.123123123-172648sdfsd76f8s7d6f8sd -->
			<!-- Get it from your GoogleService-Info.plist -->
			<!-- Read more - https://developers.google.com/identity/sign-in/ios/start-integrating -->
		</array>
	</dict>
</array>
```



## Usage

    ```javascript
    import { Component, OnInit } from "@angular/core";
    import { GoogleLogin } from 'nativescript-google-login';
    import * as application from "tns-core-modules/application";
    import { isIOS } from "tns-core-modules/platform/platform";


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

            if(isIOS){
                GoogleLogin.init({
                    google: {
                        initialize: true,
                        serverClientId: "",
                        clientId: "",
                        isRequestAuthCode: true
                    },
                    viewController: application.ios.rootController
                });
        
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

    ```

### Result

    ```
        ==== object dump start ====
        authCode: 4/sQFws5V78SYGYHxhxxZcpfTUNdf4tzWNyWwTesopXrfTM1SH5txNoPkaQ11hTkXxw3IJqXQcBu5iT6zlPFm42qs
        code: 0
        displayName: Firstname Lastname
        photo: https://lh4.googleusercontent.com/-bxWt9qbfGOw/AAAAAAAAAAI/AAAAAAAAAAA/TkXxw3IJqXQcBu5iT61trzDOW8S1tcCYM4Q/s100/photo.jpg
        error: undefined
        id: 153078403269102635592
        userToken: user@gmail.com
        provider: google
        ==== object dump end ====
    ```

## License

Apache License Version 2.0, January 2004
