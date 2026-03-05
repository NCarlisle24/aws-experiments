import ROUTES from '../routes.ts';
import { AuthContextData, AuthStatus, useAuth } from '../auth';
import ProfileIcon from './ProfileIcon.tsx';
import NavLink from './NavLink.tsx';

import React from 'react';
import ProfileMenu from './ProfileMenu.tsx';

export default function Navbar() {
    const [profileMenuIsVisible, setProfileMenuVisibility] = React.useState<Boolean>(false);
    const profileIconRef = React.useRef<HTMLAnchorElement>(null);
    const profileMenuRef = React.useRef<HTMLDivElement>(null);

    const authContextData: AuthContextData = useAuth();
    const authStatus = authContextData.getStatus();

    const toggleProfileMenuVisibility = () => {
        setProfileMenuVisibility(prev => !prev);
    }

    const handleClickForProfileMenu = (e: MouseEvent) => {
        const clickedProfileIcon = profileIconRef.current && profileIconRef.current.contains(e.target as Node);
        const clickedProfileMenu = profileMenuRef.current && profileMenuRef.current.contains(e.target as Node);

        if (clickedProfileIcon) {
            toggleProfileMenuVisibility();
        } else if (!clickedProfileMenu) {
            setProfileMenuVisibility(false);
        }
    }

    React.useEffect(() => {
        document.addEventListener('mousedown', handleClickForProfileMenu);
        return () => {
            document.removeEventListener('mousedown', handleClickForProfileMenu);
        }
    }, []);

    return (
        <div className="sticky top-0 z-1024 shadow-md h-(--navbar-height) flex justify-end items-center 
                        px-6 py-5 gap-6 bg-secondary">

            <NavLink dest={ROUTES.HOME}>Home</NavLink>
            <NavLink dest={ROUTES.PROJECTS}>Projects</NavLink>

            {AuthStatus.isEqual(authStatus, AuthStatus.LOGGED_OUT) ?
                <a href={ROUTES.LOGIN}>Sign in</a>
                : 
                <>
                    <a className="h-full flex-col justify-center items-center aspect-square cursor-pointer" 
                    ref={profileIconRef}>
                        <ProfileIcon></ProfileIcon>
                    </a>
                    <ProfileMenu isVisible={profileMenuIsVisible} ref={profileMenuRef}></ProfileMenu>
                </>
            }

        </div>
    )
}