import React from 'react';
import type { AuthContextData } from './data/AuthContextData.ts';
import { AuthStatus } from './data/AuthStatus.ts';

type AuthContextProviderProps = {
    children: React.ReactNode,
    authContextData: AuthContextData
};

const AuthContext = React.createContext<AuthContextData | null>(null);

// fancy custom hook to automatically handle potential null cases
export function useAuth(): AuthContextData {
    const context = React.useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthContextProvider.");
    }

    // check if the status is good to read
    // TODO: define readable statuses in AuthStatus instead?
    const authStatus = context.getStatus();
    if (AuthStatus.isEqual(authStatus, AuthStatus.INVALID)
        || AuthStatus.isEqual(authStatus, AuthStatus.LOADING))
    {
        throw new Error("Internal auth status error (unreadable status). Status = " + authStatus);
    }

    return context as AuthContextData;
}

export function AuthContextProvider({ children, authContextData }: AuthContextProviderProps) {
    return (
        <AuthContext.Provider value={authContextData}>
            {children}
        </AuthContext.Provider>
    );
}