import useAuth from "./context/useAuth.ts";
import { ROUTES } from "../router.ts";

import { Navigate, Outlet } from "react-router-dom";

export default function RequireAuth() {
    const authContextData = useAuth();

    if (!authContextData.isLoggedIn()) {
        return <Navigate to={ROUTES.LOGIN} replace={true}></Navigate>;
    }

    return (
        <Outlet />
    );
}