import { Observable } from '@nativescript/core';

export interface ILogger {
    (msg: any, tag: string): void;
}

/**
 * Describes a login result callback.
 */
export interface ILoginResult {
    /**
     * Gets the auth token (if requested).
     */
    authToken?: string;
    /**
     * Offline auth code used by servers to request new auth tokens.
     */
    authCode?: string;
    /**
     * Gets the result code.
     */
    code: LoginResultType;
    /**
     * The display name.
     */
    displayName?: string;
    /**
     * First name of the user.
     */
    firstName?: string;
    /**
     * Last name of the user.
     */
    lastName?: string;
    /**
     * Gets the error (if defined).
     */
    error?: any;
    /**
     * The ID of the user.
     */
    id?: string;
    /**
     * The photo URL.
     */
    photo?: string;
    /**
     * Gets the underlying provider.
     */
    provider?: string;
    /**
     * The user token, like email address.
     */
    userToken?: string;
}


/**
 * Stores data of the result of an initialization.
 */
export type IInitializationResult = { isInitialized: boolean; error?: any };

/**
 * List of login result types.
 */
export enum LoginResultType {
    /**
     * Success
     */
    Success = 0,

    /**
     * "Unhandled" exception
     */
    Exception = -1,

    /**
     * Cancelled
     */
    Cancelled = 1,

    /**
     * Failed
     */
    Failed = -2
}

export const LOGTAG_INIT_ENV = "initEnvironment()";
export const LOGTAG_LOGIN_WITH_FB = "loginWithFacebook()";
export const LOGTAG_LOGIN_WITH_GOOGLE = "loginWithGoogle()";
export const LOGTAG_LOGOUT = "logout()";

export declare type ILoginConfiguration = Partial<IConfig>;

/**
 * Describes an object that stores configuration for initialization.
 */
export interface IConfig {
    /**
     * The underlying custom activity to use.
     * @type android.app.Activity
     */
    activity: any;

    viewController: any;
    /**
     * Google specific configuration.
     */
    google: {
        /**
         * Initialize Google or not. Default: (true)
         */
        initialize?: boolean;
        /**
         * The server client ID for requesting server auth token.
         */
        serverClientId?: string;
        /**
         * If true, it will request for offline auth code which server can use for fetching or refreshing auth tokens. It will be set in authCode property of result object.
         * If false (default), it will request for token id. it will be set in authToken property of result object.
         */
        isRequestAuthCode?: boolean;
        /**
         * iOS only. Default to true
         */
        shouldFetchBasicProfile?: boolean;

        clientId: string;
        /**
         * iOS only
         */
        scopes?: string[];
    };
    /**
     * Fallback action for the result of the underlying activity.
     */
    onActivityResult: (
        requestCode: number,
        resultCode: number,
        data: any
    ) => void;
}

export function merge(to: Object, from: Object) {
    const copy = Object.assign({}, to);
    for (const n in from) {
        if (Array.isArray(to[n])) {
            copy[n] = copy[n].concat(
                from[n].filter(el => copy[n].indexOf(el) === -1)
            );
        } else if (typeof to[n] !== "object") {
            copy[n] = from[n];
        } else if (typeof from[n] === "object") {
            copy[n] = merge(copy[n], from[n]);
        }
    }
    return copy;
}

export abstract class Common extends Observable {
    static Config: ILoginConfiguration;
    protected static _loginCallback: (result: Partial<ILoginResult>) => void;
    static defaultConfig: IConfig = {
        activity: void 0,
        viewController: void 0,
        google: {
            initialize: true,
            isRequestAuthCode: false,
            serverClientId: void 0,
            clientId: "",
            shouldFetchBasicProfile: true,
            scopes: ["profile", "email"]
        },
        onActivityResult: void 0
    };
    constructor() {
        super();
    }

    protected static logResult(resultCtx, tag) {
        for (let p in resultCtx) {
            if (resultCtx.hasOwnProperty(p)) {
                console.log(`result. ${p} = ${resultCtx[p]}`, tag);
            }
        }
    }

}
