import { useAuthenticator, Loader } from "@aws-amplify/ui-react";
import React from 'react';
import { useNavigate } from "react-router-dom";

import SignIn from './SignIn.tsx';
import { AuthStatus } from './data/AuthStatus.ts';
import { AuthContextProvider } from "./AuthContextProvider.tsx";
import { authManager } from "./manager.tsx";

type AuthBridgeProps = { 
    children: React.ReactNode
};

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

    // below runs DURING each render to prevent flashing or stuttering; maybe optimize?
    authManager.setStatusFromAmplifyAuthStatus(amplifyAuthStatus);
    const currentAuthStatus = authManager.getStatus();

    return (
        <AuthContextProvider>
            {currentAuthStatus == AuthStatus.LOADING ? <Loader variation="linear"></Loader> : children}
        </AuthContextProvider>
    )
}