import { useAuthenticator } from "@aws-amplify/ui-react";

export type AmplifyAuthStatus = ReturnType<typeof useAuthenticator>['authStatus']; // some magic to get amplify's auth status type

interface AuthStatusInfo {
    amplifyAuthStatus: AmplifyAuthStatus,
};

const VALUES = {
    LOGGED_IN:  "logged in",
    LOGGED_OUT: "logged out",
    LOADING:    "loading",
    INVALID:    "invalid"
} as const;

type AuthStatusKey = keyof typeof VALUES;
export type AuthStatus = typeof VALUES[AuthStatusKey];

const MAP: Partial<Record<AuthStatus, AuthStatusInfo>> = {
    [VALUES.LOGGED_IN]: {
        amplifyAuthStatus: "authenticated",
    },
    [VALUES.LOGGED_OUT]: {
        amplifyAuthStatus: "unauthenticated",
    },
    [VALUES.LOADING]: {
        amplifyAuthStatus: "configuring",
    }
} as const;

const DEFAULT_VALUE: AuthStatus = VALUES.LOADING;

const VALID_VALUES = Object.keys(MAP) as AuthStatus[];

export const AuthStatus = (() => {
    const isValid = (authStatus: AuthStatus): boolean => {
        return VALID_VALUES.includes(authStatus);
    }

    const isEqual = (status1: AuthStatus, status2: AuthStatus): boolean => {
        return (status1 === status2);
    }

    const getInfo = (authStatus: AuthStatus): AuthStatusInfo => {
        if (!isValid(authStatus)) {
            return MAP[DEFAULT_VALUE]!;
        }

        return MAP[authStatus]!;
    }

    const getAmplifyAuthStatus = (authStatus: AuthStatus): AmplifyAuthStatus => {
        return getInfo(authStatus).amplifyAuthStatus;
    }

    const getFromAmplifyAuthStatus = (amplifyStatus: AmplifyAuthStatus): AuthStatus => {
        for (const authStatus of VALID_VALUES) {
            if (amplifyStatus === getAmplifyAuthStatus(authStatus)) {
                return authStatus;
            }
        }

        return VALUES.INVALID;
    }

    console.assert(isValid(DEFAULT_VALUE));

    return {
        ...VALUES,
        VALID_VALUES,
        isValid,
        isEqual,
        getAmplifyAuthStatus,
        getFromAmplifyAuthStatus
    }
})();