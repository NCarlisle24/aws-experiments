import React from 'react';

import type { AuthContextData } from './data/AuthContextData.ts';
import AuthContext from './AuthContext.ts';

type AuthContextProviderProps = {
    children: React.ReactNode,
    authContextData: AuthContextData
};

export function AuthContextProvider({ children, authContextData }: AuthContextProviderProps) {
    return (
        <AuthContext.Provider value={authContextData}>
            {children}
        </AuthContext.Provider>
    );
}