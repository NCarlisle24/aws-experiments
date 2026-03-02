import { useAuthenticator } from "@aws-amplify/ui-react";

export type AuthStatus = string;
export type AmplifyAuthStatus = ReturnType<typeof useAuthenticator>['authStatus']; // some magic to get amplify's auth status type

interface AuthStatusInfo {
    amplifyAuthStatus: AmplifyAuthStatus
};

export const AuthStatus = (() => {
    const VALUES = {
        LOGGED_IN:  "logged in",
        LOGGED_OUT: "logged out",
        LOADING:    "loading",
        INVALID:    "invalid"
    } as const;

    const DEFAULT_VALUE: AuthStatus = VALUES.LOADING;

    const MAP: Record<AuthStatus, AuthStatusInfo> = {
        [VALUES.LOGGED_IN]: {
            amplifyAuthStatus: "authenticated"
        },
        [VALUES.LOGGED_OUT]: {
            amplifyAuthStatus: "unauthenticated"
        },
        [VALUES.LOADING]: {
            amplifyAuthStatus: "configuring"
        }
    } as const;

    const VALID_VALUES = Object.keys(MAP);

    const isValid = (authStatus: AuthStatus): boolean => {
        return VALID_VALUES.includes(authStatus);
    }

    const getAmplifyAuthStatus = (authStatus: AuthStatus): AmplifyAuthStatus => {
        if (!isValid(authStatus)) {
            return MAP[DEFAULT_VALUE].amplifyAuthStatus;
        }

        return MAP[authStatus].amplifyAuthStatus;
    }

    const getFromAmplifyAuthStatus = (amplifyStatus: AmplifyAuthStatus): AuthStatus => {
        for (const AuthStatus of VALID_VALUES) {
            if (amplifyStatus === getAmplifyAuthStatus(AuthStatus)) {
                return AuthStatus;
            }
        }

        return VALUES.INVALID;
    }

    console.assert(isValid(DEFAULT_VALUE))

    return {
        ...VALUES,
        DEFAULT: DEFAULT_VALUE,
        VALID_VALUES,
        isValid,
        getAmplifyAuthStatus,
        getFromAmplifyAuthStatus
    }
})();