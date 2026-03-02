import { AuthStatus } from "./AuthStatus.ts";

export class AuthContextData {
    private status: AuthStatus = AuthStatus.DEFAULT;

    getStatus(): AuthStatus {
        return this.status;
    }

    setStatus(status: AuthStatus): boolean {
        if (!AuthStatus.isValid(status)) {
            this.status = AuthStatus.INVALID;
            return false;
        }

        this.status = status;
        return true;
    }
}