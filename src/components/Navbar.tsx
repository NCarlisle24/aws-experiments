import ROUTES from '../routes.ts';

import { AuthContextData, AuthStatus, useAuth } from '../auth';
import ProfileIcon from './ProfileIcon.tsx';

export default function Navbar() {
    const authContextData: AuthContextData = useAuth();
    const authStatus = authContextData.getStatus();

    return (
        <div className="sticky top-0 z-1024 shadow-md h-(--navbar-height) flex justify-end items-center 
                        p-6 gap-6 bg-secondary">
            <a href={ROUTES.HOME}>Home</a>
            {AuthStatus.isEqual(authStatus, AuthStatus.LOGGED_OUT) ?
                <a href={ROUTES.LOGIN}>Sign in</a>
                : <ProfileIcon></ProfileIcon>
            }
        </div>
    )
}