import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from 'aws-amplify/auth';
import React from 'react';

import { AuthStatus } from './data/AuthStatus.ts';
import { AuthContextProvider } from "./AuthContextProvider.tsx";
import { AuthManager } from "./AuthManager.ts";
import { AuthContextData } from "./data/AuthContextData.ts";

import LargeLoader from "../components/LargeLoader.tsx";

interface AuthBridgeProps { 
    children: React.ReactNode
};

const authManager: AuthManager = new AuthManager();

export default function AuthBridge({ children }: AuthBridgeProps) {
    /* 
    AuthStatus (accessed via ctx.route) tells you where the user is in terms of authentication (as a string)
    - i.e. idle, setup, signIn, signUp, forgotPassword, signOut, etc.
    - 'authenticated' means the user is signed in

    authStatus (accessed via ctx.authStatus) is the same as AuthStatus but only has the states
    'configuring', 'authenticated', and 'unauthenticated'.
    - 'configuring' only occurs when the Authenticator context is loading
    */

    const { authStatus: amplifyAuthStatus } = useAuthenticator((ctx) => [ctx.authStatus]); // triggers rerenders with useEffect behavior
    const [ contextData, setContextData ] = React.useState<AuthContextData>(authManager.getContextData());

    React.useEffect(() => {
        authManager.setStatusFromAmplifyAuthStatus(amplifyAuthStatus);

        (async () => {
            try {
                const sessionInfo = await fetchAuthSession();
                authManager.processAmplifySession(sessionInfo);
            } catch (error) {
                console.error("Error occurred while initializing auth manager (you might be logged out; see below).");
                console.error(error);
            } finally {
                authManager.triggerRerender();
                const newContextData = authManager.getContextData();
                setContextData(newContextData); // trigger a rerender
            }
        })();
    }, [amplifyAuthStatus]);

    return (
        <AuthContextProvider authContextData={contextData}>
            {AuthStatus.isEqual(contextData.getStatus(), AuthStatus.LOADING) ? 
            <LargeLoader></LargeLoader>
            : children}
        </AuthContextProvider>
    )
}