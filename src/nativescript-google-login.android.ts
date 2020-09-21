import { AndroidActivityResultEventData, AndroidApplication, Application } from "@nativescript/core";
import { isNullOrUndefined } from "@nativescript/core/utils/types";
import { Common, IInitializationResult, ILoginResult, LoginResultType, merge, ILoginConfiguration, LOGTAG_LOGOUT } from "./nativescript-google-login.common";

const LOGTAG_ON_ACTIVITY_RESULT = "onActivityResult()";

declare const java;

declare var com: any;

const actionRunnable = (function () {
    return java.lang.Runnable.extend({
        action: undefined,
        run() {
            this.action();
        }
    });
})();

export class GoogleLogin extends Common {
    private static _googleClient: any; // com.google.android.gms.common.api.GoogleApiClient
    private static _rcGoogleSignIn: number = 597; // < 16 bits
    private static _handleResult: boolean = false;

    static init(config: ILoginConfiguration = {}): IInitializationResult {
        this.Config = merge(this.defaultConfig, config);
        let result: IInitializationResult = { isInitialized: false };
        GoogleLogin._handleResult = true; // to avoid calling the call back 2 times
        console.log("activity: " + GoogleLogin.Config.activity);

        if (isNullOrUndefined(GoogleLogin.Config.activity)) {
            GoogleLogin.Config.activity = Application.android.foregroundActivity || Application.android.startActivity;
        }

        // Google
        if (GoogleLogin.Config.google.initialize) {
            result = GoogleLogin.initGoogle(result);
        }

        if (!isNullOrUndefined(GoogleLogin.Config.activity)) {
            const onLoginResult = ({ requestCode, resultCode, intent }: AndroidActivityResultEventData) => {
                if (!GoogleLogin._handleResult) return;


                if (requestCode === GoogleLogin._rcGoogleSignIn) {
                    const resultCtx: Partial<ILoginResult> = {};
                    let callback = GoogleLogin._loginCallback;
                    let activityResultHandled = false;
                    GoogleLogin._handleResult = false;

                    try {
                        if (requestCode === GoogleLogin._rcGoogleSignIn) {
                            resultCtx.provider = "google";

                            activityResultHandled = true;

                            if (resultCode === android.app.Activity.RESULT_OK) {
                                console.log("OK");

                                const signInResult = com.google.android.gms.auth.api.Auth.GoogleSignInApi.getSignInResultFromIntent(intent);
                                if (signInResult.isSuccess()) {
                                    console.log("Success");

                                    resultCtx.code = LoginResultType.Success;

                                    const account = signInResult.getSignInAccount();

                                    const usrId = account.getId();
                                    if (!isNullOrUndefined(usrId)) {
                                        resultCtx.id = usrId;
                                    }

                                    const photoUrl = <android.net.Uri>(account.getPhotoUrl());
                                    if (!isNullOrUndefined(photoUrl)) {
                                        resultCtx.photo = photoUrl.toString();
                                    }

                                    resultCtx.authToken = account.getIdToken();
                                    resultCtx.authCode = account.getServerAuthCode();
                                    resultCtx.userToken = account.getEmail();
                                    resultCtx.displayName = account.getDisplayName();
                                    resultCtx.firstName = account.getGivenName();
                                    resultCtx.lastName = account.getFamilyName();
                                } else {
                                    console.log("NO SUCCESS!");
                                    resultCtx.code = LoginResultType.Failed;
                                }
                            } else if (resultCode === android.app.Activity.RESULT_CANCELED) {
                                console.log("Cancelled");
                                resultCtx.code = LoginResultType.Cancelled;
                            }

                            GoogleLogin.logResult(resultCtx, LOGTAG_ON_ACTIVITY_RESULT);
                        }
                    } catch (e) {
                        console.log("[ERROR] " + e);

                        resultCtx.code = LoginResultType.Exception;
                        resultCtx.error = e;
                    }

                    if (!activityResultHandled && !isNullOrUndefined(GoogleLogin.Config.onActivityResult)) {
                        console.log("Handling onActivityResult() defined in config...");

                        GoogleLogin.Config.onActivityResult(requestCode, resultCode, intent);
                    }

                    console.log("Calling Callback function with Results");
                    callback && callback(resultCtx);
                    Application.android.off(AndroidApplication.activityResultEvent, onLoginResult);
                }
            };

            Application.android.on(AndroidApplication.activityResultEvent, onLoginResult);
        }

        return result;
    }

    static login(callback: (result: Partial<ILoginResult>) => void) {
        try {
            this._loginCallback = callback;

            const uiAction = new actionRunnable();
            uiAction.action = () => {
                try {
                    const signInIntent = GoogleLogin._googleClient.getSignInIntent();

                    GoogleLogin.Config.activity.startActivityForResult(signInIntent, GoogleLogin._rcGoogleSignIn);
                } catch (e) {
                    console.log("[ERROR] runOnUiThread(): " + e);
                }
            };

            console.log("Starting activity for result...");
            GoogleLogin.Config.activity.runOnUiThread(uiAction);
        } catch (e) {
            console.log("[ERROR] " + e);
            throw e;
        }
    }

    static logout(callback: () => void) {
        console.log("Starting Logout", LOGTAG_LOGOUT);
        try {
            GoogleLogin._googleClient.signOut();
            callback();
            console.log("[SUCCESS] logging out: ", LOGTAG_LOGOUT);
        } catch (e) {
            console.log("[ERROR] Logging out: " + e, LOGTAG_LOGOUT);
            callback();
        }
    }

    private static initGoogle(result: IInitializationResult): IInitializationResult {
        try {
            // Strange?!
            result.isInitialized = true;
            // let optionBuilder = new com.google.android.gms.auth.api.signin.GoogleSignInOptions.Builder(
            //     com.google.android.gms.auth.api.signin.GoogleSignInOptions.DEFAULT_SIGN_IN
            // )
            //     .requestEmail()
            //     .requestProfile();

            let gso = new com.google.android.gms.auth.api.signin.GoogleSignInOptions.Builder(com.google.android.gms.auth.api.signin.GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail();


            if (!isNullOrUndefined(GoogleLogin.Config.google.serverClientId)) {
                if (!GoogleLogin.Config.google.isRequestAuthCode) {
                    console.log("Will request ID token");
                    gso = gso.requestIdToken(
                        GoogleLogin.Config.google.serverClientId
                    );
                } else {
                    console.log("Will request server auth code");
                    gso = gso.requestServerAuthCode(
                        GoogleLogin.Config.google.serverClientId
                    );
                }
            }

            gso = gso.build();

            GoogleLogin._googleClient = com.google.android.gms.auth.api.signin.GoogleSignIn.getClient(GoogleLogin.Config.activity, gso);
        } catch (e) {
            console.log("[ERROR] init.google: " + e);

            result.error = e;
        }
        return result;
    }
}