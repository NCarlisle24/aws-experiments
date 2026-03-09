import React from 'react';

import type { AuthContextData } from './AuthContextData.ts';
import AuthContext from './AuthContext.ts';

type AuthContextProviderProps = {
    children: React.ReactNode,
    authContextData: AuthContextData
};

export default function AuthContextProvider({ children, authContextData }: AuthContextProviderProps) {
    return (
        <AuthContext.Provider value={authContextData}>
            {children}
        </AuthContext.Provider>
    );
}