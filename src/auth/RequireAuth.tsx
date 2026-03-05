import useAuth from "./useAuth.ts";
import { AuthStatus } from "./data/AuthStatus.ts";
import ROUTES from "../routes.ts";

import { Navigate, Outlet } from "react-router-dom";

export default function RequireAuth() {
    const authContextData = useAuth();
    const authStatus = authContextData.getStatus();

    if (!AuthStatus.isEqual(authStatus, AuthStatus.LOGGED_IN)) {
        return <Navigate to={ROUTES.LOGIN} replace={true}></Navigate>;
    }

    return (
        <Outlet />
    );
}