import React from 'react';
import { authManager, type AuthManager } from './manager.tsx';

export type AuthContextProviderProps = {
    children: React.ReactNode
};

const AuthContext = React.createContext<AuthManager>(authManager);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
    return (
        <AuthContext.Provider value={authManager}>
            {children}
        </AuthContext.Provider>
    );
}