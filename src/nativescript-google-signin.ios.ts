import { ios } from "tns-core-modules/application/application";
import {
    ILoginResult,
    LoginResultType,
    Common,
    LOGTAG_LOGIN_WITH_GOOGLE,
    LOGTAG_LOGOUT,
    IInitializationResult,
    merge,
    ILoginConfiguration
} from "./nativescript-google-signin.common";

const LOGTAG_ON_GOOGLE_RESULT = "Google successCallback";

export class GoogleSignin extends Common {

    private static googleSignIn: GIDSignIn = null;
    private static _googleProfileInfoCallback;
    private static googleFailCallback: (error: NSError) => void;
    private static googleCancelCallback: () => void;
    private static googleSuccessCallback: (result: ILoginResult) => void;

    static login(callback: (result: ILoginResult) => void) {
        const invokeLoginCallbackForGoogle = (resultCtx: ILoginResult) => {
            resultCtx.provider = "google";

            this.logResult(resultCtx, LOGTAG_LOGIN_WITH_GOOGLE);

            // tslint:disable-next-line:no-unused-expression
            callback && callback(resultCtx);
        };

        this.googleFailCallback = (error: NSError) => {
            console.log("onError() - "+LOGTAG_LOGIN_WITH_GOOGLE);

            invokeLoginCallbackForGoogle({
                code: LoginResultType.Failed,
                error: error.localizedDescription
            });
        };

        this.googleCancelCallback = () => {
            console.log("onCancel() - "+LOGTAG_LOGIN_WITH_GOOGLE);

            invokeLoginCallbackForGoogle({
                code: LoginResultType.Cancelled
            });
        };

        this.googleSuccessCallback = result => {
            console.log("onSuccess().onCompleted() - "+LOGTAG_LOGIN_WITH_GOOGLE);

            invokeLoginCallbackForGoogle({
                authCode: result.authCode,
                code: LoginResultType.Success,
                displayName: result.displayName,
                photo: result.photo,
                error: result.error,
                id: result.id,
                userToken: result.userToken
            });
        };

        if (!!callback) {
        this._googleProfileInfoCallback = callback;

            const delegate = this.createSignInDelegate();
            if (!this.googleSignIn.delegate) {
                this.googleSignIn.delegate = delegate;
            }
            if (!this.googleSignIn.presentingViewController) {
                this.googleSignIn.presentingViewController = delegate;
            }

            this.googleSignIn.signIn();
        }
    }

    private static createSignInDelegate() {
        const self = this;
        class MySignInDelegate extends NSObject {
            static ObjCProtocols = [GIDSignInDelegate];

            constructor() {
                super();
            }

            signInDidSignInForUserWithError(signIn, user, error: NSError) {
                if (error) {
                    self.googleFailCallback(error);
                } else {
                    try {
                        const resultUser: ILoginResult = {
                            code: LoginResultType.Success,
                            userToken: user.profile.email,
                            firstName: user.profile.givenName,
                            lastName: user.profile.familyName,
                            displayName: user.profile.name,
                            photo: user.profile.imageURLWithDimension(100),
                            authCode: user.serverAuthCode
                                ? user.serverAuthCode
                                : user.authentication.idToken,
                            id: user.userID
                        }; // Safe to send to the server // For client-side use only!

                        self.googleSuccessCallback(resultUser);

                        if (!self._googleProfileInfoCallback) {
                            console.log(
                                "no callback set "+LOGTAG_ON_GOOGLE_RESULT
                            );
                        }
                    } catch (error) {
                        self.googleFailCallback(error);
                    }
                }
            }

            signInDidDisconnectWithUserWithError(signIn, user, error: NSError) {
                try {
                    if (error) {
                        self.googleFailCallback(error);
                    } else {
                        // googleSuccessCallback("logOut");
                        self.googleCancelCallback();
                    }
                } catch (error) {
                    self.googleFailCallback(error);
                }
            }

            // signInWillDispatchError(signIn, error) {
            // }

            signInPresentViewController(signIn, viewController) {
                const uiview = ios.rootController;
                uiview.presentViewControllerAnimatedCompletion(
                    viewController,
                    true,
                    null
                );
            }

            signInDismissViewController(signIn, viewController) {
                viewController.dismissViewControllerAnimatedCompletion(
                    true,
                    null
                );
            }
        }

        return new MySignInDelegate();
    }

    static init(config: ILoginConfiguration = {}): ILoginConfiguration {
        this.Config = merge(this.defaultConfig, config);
        GoogleSignin.googleSignIn = GIDSignIn.sharedInstance();
        GoogleSignin.googleSignIn.shouldFetchBasicProfile = GoogleSignin.Config.google.shouldFetchBasicProfile;
        GoogleSignin.googleSignIn.clientID = GoogleSignin.Config.google.clientId;
        GoogleSignin.googleSignIn.scopes = NSArray.arrayWithArray(<any>GoogleSignin.Config
                .google.scopes);

            // Setting 'googleSignIn.serverClientID' forces retrieval of an offline auth code in iOS.
            // Set it only if that's what the user is expecting to retrieve.
            if (
                GoogleSignin.Config.google.serverClientId &&
                GoogleSignin.Config.google.isRequestAuthCode
            ) {
                GoogleSignin.googleSignIn.serverClientID = GoogleSignin.Config.google.serverClientId;
            }
        return this.Config;
    }

    createSignin(){
        
    }

    
    

}
