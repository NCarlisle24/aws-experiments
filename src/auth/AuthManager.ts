import { type AuthSession } from 'aws-amplify/auth'

import { AuthStatus, type AmplifyAuthStatus } from './enums/AuthStatus';
import { AuthContextData, MutableAuthContextData } from './context';
import { type UserGroup } from '../../amplify/data/groups';

interface AmplifyCognitoPayload {
    email?: string,
    'cognito:groups'?: string[],
    [key: string]: any // catch any other entries
}

export class AuthManager {
    // TODO: get rid of open/closed issue here
    private contextData: MutableAuthContextData = new MutableAuthContextData();

    public setStatusFromAmplifyAuthStatus (status: AmplifyAuthStatus) {
        const newAuthStatus: AuthStatus = AuthStatus.getFromAmplifyAuthStatus(status);
        return this.contextData.setStatus(newAuthStatus);
    }

    public processAmplifySession (session: AuthSession): boolean {
        const payload = session.tokens?.idToken?.payload as AmplifyCognitoPayload | undefined;

        const userId = session.userSub ?? "";
        const identityId = session.identityId ?? "";
        const userEmail = payload?.email ?? "";
        const userGroups = payload?.["cognito:groups"] ?? [];

        let writeSucceeded = true;

        if (!this.contextData.setUserId(userId)) {
            console.error("Error occurred while attempting to write user ID.");
            writeSucceeded = false;
        }

        if (!this.contextData.setIdentityId(identityId)) {
            console.error("Error while attempting to write identity ID.");
            writeSucceeded = false;
        }

        if (!this.contextData.setUserEmail(userEmail)) {
            console.error("Error while attempting to write user email.");
            writeSucceeded = false;
        }

        if (!this.contextData.setUserGroups(userGroups as UserGroup[])) {
            console.error("Error while attempting to write user groups.");
            writeSucceeded = false;
        }

        return writeSucceeded;
    }

    public getContextData(): AuthContextData {
        return this.contextData; // implicit upcast here
    }

    public triggerRerender(): boolean {
        this.contextData = new MutableAuthContextData(this.contextData);
        return true;
    }
}