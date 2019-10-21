import {
    Common,
    IInitializationResult,
    ILoginResult,
    LoginResultType,
    merge,
    ILoginConfiguration
} from "./nativescript-google-signin.common";
import { isNullOrUndefined } from "tns-core-modules/utils/types";
import {
    android as Android,
    AndroidApplication,
    AndroidActivityResultEventData
} from "tns-core-modules/application/application";

const LOGTAG_ON_ACTIVITY_RESULT = "onActivityResult()";

declare const java;

declare var com: any

const actionRunnable = (function() {
    return java.lang.Runnable.extend({
        action: undefined,
        run() {
            this.action();
        }
    });
})();

export class GoogleSignin extends Common {
    private static _googleClient: any; // com.google.android.gms.common.api.GoogleApiClient
    private static _rcGoogleSignIn: number = 597; // < 16 bits

    static init(config: ILoginConfiguration = {}): IInitializationResult {
        this.Config = merge(this.defaultConfig, config);
        let result : IInitializationResult = {
            isInitialized : false
        };
        console.log("activity: " + GoogleSignin.Config.activity);

        if (isNullOrUndefined(GoogleSignin.Config.activity)) {
            GoogleSignin.Config.activity =
                Android.foregroundActivity || Android.startActivity;
        }

        // Google
        if (GoogleSignin.Config.google.initialize) {
            result = GoogleSignin.initGoogle(result);
        }

        if (!isNullOrUndefined(GoogleSignin.Config.activity)) {
            const onLoginResult = ({
                requestCode,
                resultCode,
                intent
            }: AndroidActivityResultEventData) => {
                if (requestCode === GoogleSignin._rcGoogleSignIn) {
                    const resultCtx: Partial<ILoginResult> = {};
                    let callback = GoogleSignin._loginCallback;
                    let activityResultHandled = false;

                    try {
                        if (requestCode === GoogleSignin._rcGoogleSignIn) {
                            resultCtx.provider = "google";

                            activityResultHandled = true;

                            if (resultCode === android.app.Activity.RESULT_OK) {
                                console.log("OK");

                                const signInResult = com.google.android.gms.auth.api.Auth.GoogleSignInApi.getSignInResultFromIntent(
                                    intent
                                );
                                if (signInResult.isSuccess()) {
                                    console.log("Success");

                                    resultCtx.code = LoginResultType.Success;

                                    const account = signInResult.getSignInAccount();

                                    const usrId = account.getId();
                                    if (!isNullOrUndefined(usrId)) {
                                        resultCtx.id = usrId;
                                    }

                                    const photoUrl = <android.net.Uri>(
                                        account.getPhotoUrl()
                                    );
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
                            } else if (
                                resultCode ===
                                android.app.Activity.RESULT_CANCELED
                            ) {
                                console.log("Cancelled");

                                resultCtx.code = LoginResultType.Cancelled;
                            }

                            GoogleSignin.logResult(
                                resultCtx,
                                LOGTAG_ON_ACTIVITY_RESULT
                            );
                        }
                    } catch (e) {
                        console.log("[ERROR] " + e);

                        resultCtx.code = LoginResultType.Exception;
                        resultCtx.error = e;
                    }

                    if (!activityResultHandled) {
                        if (
                            !isNullOrUndefined(
                                GoogleSignin.Config.onActivityResult
                            )
                        ) {
                            console.log(
                                "Handling onActivityResult() defined in config..."
                            );

                            GoogleSignin.Config.onActivityResult(
                                requestCode,
                                resultCode,
                                intent
                            );
                        }
                    }

                    console.log("Calling Callback function with Results");
                    // tslint:disable-next-line:no-unused-expression
                    callback && callback(resultCtx);
                    Android.off(
                        AndroidApplication.activityResultEvent,
                        onLoginResult
                    );
                }
            };

            Android.on(AndroidApplication.activityResultEvent, onLoginResult);
        }

        return result;
    }

    static login(callback: (result: Partial<ILoginResult>) => void) {
        try {
            this._loginCallback = callback;

            const uiAction = new actionRunnable();
            uiAction.action = () => {
                try {
                    const signInIntent = 
                        GoogleSignin._googleClient.getSignInIntent();

                    
                    GoogleSignin.Config.activity.startActivityForResult(
                        signInIntent,
                        GoogleSignin._rcGoogleSignIn
                    );
                } catch (e) {
                    console.log(
                        "[ERROR] runOnUiThread(): " + e,
                    );
                }
            };

            console.log("Starting activity for result...");
            GoogleSignin.Config.activity.runOnUiThread(uiAction);
        } catch (e) {
            console.log("[ERROR] " + e);

            throw e;
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
                .requestEmail()
                


            if (!isNullOrUndefined(GoogleSignin.Config.google.serverClientId)) {
                if (!GoogleSignin.Config.google.isRequestAuthCode) {
                    console.log("Will request ID token");
                    gso = gso.requestIdToken(
                        GoogleSignin.Config.google.serverClientId
                    );
                } else {
                    console.log("Will request server auth code");
                    gso = gso.requestServerAuthCode(
                        GoogleSignin.Config.google.serverClientId
                    );
                }
            }

            gso = gso.build();

            
            GoogleSignin._googleClient = com.google.android.gms.auth.api.signin.GoogleSignIn.getClient(GoogleSignin.Config.activity, gso);

        console.dir(GoogleSignin._googleClient);

            //GoogleSignin._googleClient = com.google.android.gms.auth.api.signin.GoogleSignIn.getClient(GoogleSignin.Config.activity.getApplicationContext(), optionBuilder);
            
            /*GoogleSignin._googleClient.connect(
                com.google.android.gms.common.api.GoogleApiClient
                    .SIGN_IN_MODE_OPTIONAL
            );*/
        } catch (e) {
            console.log("[ERROR] init.google: " + e);

            result.error = e;
        }
        return result;
    }
}
