import { ios } from "@nativescript/core/application";
import {
    ILoginResult,
    LoginResultType,
    Common,
    LOGTAG_LOGIN_WITH_GOOGLE,
    LOGTAG_LOGOUT,
    IInitializationResult,
    merge,
    ILoginConfiguration
} from "./nativescript-google-login.common";

const LOGTAG_ON_GOOGLE_RESULT = "Google successCallback";

export class GoogleLogin extends Common {
    private static googleSignIn: GIDSignIn = null;
    private static _googleProfileInfoCallback;
    private static googleFailCallback: (error: NSError) => void;
    private static googleCancelCallback: () => void;
    private static googleSuccessCallback: (result: ILoginResult) => void;
    private static delegate : any = null;

    static login(callback: (result: ILoginResult) => void) {
        const invokeLoginCallbackForGoogle = (resultCtx: ILoginResult) => {
            resultCtx.provider = "google";

            this.logResult(resultCtx, LOGTAG_LOGIN_WITH_GOOGLE);

            // tslint:disable-next-line:no-unused-expression
            callback && callback(resultCtx);
        };

        this.googleFailCallback = (error: NSError) => {
            console.log("onError() - " + LOGTAG_LOGIN_WITH_GOOGLE);

            invokeLoginCallbackForGoogle({
                code: LoginResultType.Failed,
                error: error.localizedDescription
            });
        };

        this.googleCancelCallback = () => {
            console.log("onCancel() - " + LOGTAG_LOGIN_WITH_GOOGLE);

            invokeLoginCallbackForGoogle({
                code: LoginResultType.Cancelled
            });
        };

        this.googleSuccessCallback = result => {
            console.log(
                "onSuccess().onCompleted() - " + LOGTAG_LOGIN_WITH_GOOGLE
            );

            invokeLoginCallbackForGoogle({
                authCode: result.authCode,
                code: LoginResultType.Success,
                firstName: result.firstName,
                lastName: result.lastName,                
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
            this.googleSignIn.delegate = delegate;
            this.googleSignIn.presentingViewController = this.Config.viewController;
            this.googleSignIn.signIn();
        }
    }

    static logout(callback: () => void) {
        console.log('Starting Logout', LOGTAG_LOGOUT);
        try {
            this.googleSignIn.signOut();
            callback();
            console.log('[SUCCESS] logging out: ', LOGTAG_LOGOUT);
        } catch (e) {
            callback();
            console.log('[ERROR] Logging out: ' + e, LOGTAG_LOGOUT);
        }
    }

    private static createSignInDelegate() {
        const self = this;
        if(GoogleLogin.delegate == null ){
            class GoogleSigninDelegate extends NSObject {
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
                                    "no callback set " + LOGTAG_ON_GOOGLE_RESULT
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
            this.delegate = new GoogleSigninDelegate();
        } else {
            this.delegate.signInDidSignInForUserWithError = function (signIn, user, error: NSError) {
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
                            authCode: GoogleLogin.Config.google.isRequestAuthCode
                                ? user.serverAuthCode
                                : user.authentication.idToken,
                            id: user.userID
                        }; // Safe to send to the server // For client-side use only!

                        self.googleSuccessCallback(resultUser);

                        if (!self._googleProfileInfoCallback) {
                            console.log(
                                "no callback set " + LOGTAG_ON_GOOGLE_RESULT
                            );
                        }
                    } catch (error) {
                        self.googleFailCallback(error);
                    }
                }
            }

            this.delegate.signInDidDisconnectWithUserWithError = function(signIn, user, error: NSError) {
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

        }

        return this.delegate;
    }

    static init(config: ILoginConfiguration = {}): ILoginConfiguration {
        this.Config = merge(this.defaultConfig, config);
        GoogleLogin.googleSignIn = GIDSignIn.sharedInstance();
        GoogleLogin.googleSignIn.shouldFetchBasicProfile =
            GoogleLogin.Config.google.shouldFetchBasicProfile;
        GoogleLogin.googleSignIn.clientID = GoogleLogin.Config.google.clientId;
        GoogleLogin.googleSignIn.scopes = NSArray.arrayWithArray(<any>(
            GoogleLogin.Config.google.scopes
        ));

        // Setting 'googleSignIn.serverClientID' forces retrieval of an offline auth code in iOS.
        // Set it only if that's what the user is expecting to retrieve.
        if (
            GoogleLogin.Config.google.serverClientId &&
            GoogleLogin.Config.google.isRequestAuthCode
        ) {
            GoogleLogin.googleSignIn.serverClientID =
                GoogleLogin.Config.google.serverClientId;
        }
        return this.Config;
    }

    createSignin() {}
}
