import { AuthStatus } from '../enums/AuthStatus.ts';
import AuthContext from './AuthContext.ts';
import { AuthContextData } from './AuthContextData.ts';

import React from 'react';

// fancy custom hook to automatically handle potential null cases
export default function useAuth(): AuthContextData {
    // TODO: make sure this context exists?
    const context = React.useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthContextProvider.");
    }

    // check if the status is good to read
    const authStatus = context.getStatus();
    if (AuthStatus.isEqual(authStatus, AuthStatus.INVALID)
        || AuthStatus.isEqual(authStatus, AuthStatus.LOADING))
    {
        throw new Error("Internal auth status error (unreadable status). Status = " + authStatus);
    }

    return context as AuthContextData;
}