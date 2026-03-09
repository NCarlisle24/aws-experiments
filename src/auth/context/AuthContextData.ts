import { AuthStatus } from "../enums/AuthStatus.ts";
import { type UserGroup } from "../../../amplify/data/groups.ts";

// data props

export type UserId = string;
export type IdentityId = string;
export type Email = string;

interface AuthContextDataProps {
    status:     AuthStatus;
    userId:     UserId;
    identityId: IdentityId;
    userEmail:  Email;
    userGroups: UserGroup[];
}

const DEFAULT_AUTH_CONTEXT_DATA_PROPS: AuthContextDataProps = {
    status:     AuthStatus.LOADING,
    userId:     "",
    identityId: "",
    userEmail:  "",
    userGroups: [],
}

// AuthContextData (readonly wrapper for AuthContextDataProps)

export class AuthContextData {
    protected props: AuthContextDataProps = {...DEFAULT_AUTH_CONTEXT_DATA_PROPS};

    constructor(initData?: AuthContextData) {
        if (!initData) return;
        this.setStatus(initData.getStatus());
        this.setUserId(initData.getUserId());
        this.setIdentityId(initData.getIdentityId());
        this.setUserEmail(initData.getUserEmail());
        this.setUserGroups(initData.getUserGroups());
    }

    getStatus() {
        return this.props.status;
    }

    isLoggedIn() {
        return AuthStatus.isEqual(this.getStatus(), AuthStatus.LOGGED_IN);
    }

    getUserId() {
        return this.props.userId;
    }

    getIdentityId() {
        return this.props.identityId;
    }

    getUserEmail() {
        return this.props.userEmail;
    }

    getUserGroups() {
        return this.props.userGroups;
    }

    protected setStatus(status: AuthStatus): boolean {
        if (!AuthStatus.isValid(status)) {
            this.props.status = AuthStatus.INVALID;
            return false;
        }

        this.props.status = status;
        return true;
    }

    protected setUserId(userId: UserId): boolean {
        this.props.userId = userId;
        return true;
    }

    protected setIdentityId(identityId: IdentityId): boolean {
        this.props.identityId = identityId;
        return true;
    }

    protected setUserEmail(email: Email): boolean {
        this.props.userEmail = email;
        return true;
    }

    protected setUserGroups(groups: UserGroup[]): boolean {
        // TODO: throw error if groups is empty?
        this.props.userGroups = [...groups];
        return true;
    }
}

// MutableAuthContextData

export class MutableAuthContextData extends AuthContextData {
    public setStatus(status: AuthStatus) {
        return super.setStatus(status);
    }

    public setUserId(userId: UserId) {
        return super.setUserId(userId);
    }

    public setIdentityId(identityId: IdentityId) {
        return super.setIdentityId(identityId);
    }

    public setUserEmail(email: Email) {
        return super.setUserEmail(email);
    }

    public setUserGroups(groups: UserGroup[]) {
        return super.setUserGroups(groups);
    }
}