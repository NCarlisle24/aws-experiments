import { AuthStatus, type AmplifyAuthStatus } from './data/AuthStatus';
import { AuthContextData } from './data/AuthContextData';

const ctxData: AuthContextData = new AuthContextData();

export const authManager = (() => {
    const getStatus = (): AuthStatus => {
        return ctxData.getStatus();
    };

    const setStatus = (status: AuthStatus): ReturnType<typeof ctxData.setStatus> => {
        return ctxData.setStatus(status);
    };

    const setStatusFromAmplifyAuthStatus = (status: AmplifyAuthStatus): ReturnType<typeof setStatus> => {
        const newAuthStatus: AuthStatus = AuthStatus.getFromAmplifyAuthStatus(status);
        return setStatus(newAuthStatus);
    }

    return {
        getStatus,
        setStatusFromAmplifyAuthStatus
    };
})();

export type AuthManager = typeof authManager;