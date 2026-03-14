import { useAuth } from "../auth"
import { ROUTES } from "../router";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router";

import React from 'react';

export default function ProfileIcon() {
    // setup

    const [isProfileMenuVisible, setProfileMenuVisibility] = React.useState<boolean>(false);
    const profileIconRef = React.useRef<HTMLAnchorElement>(null);
    const profileMenuRef = React.useRef<HTMLDivElement>(null);

    const authContextData = useAuth();
    const navigate = useNavigate();

    // helper functions

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

    // attach event listeners

    React.useEffect(() => {
        document.addEventListener('mousedown', handleClickForProfileMenu);
        return () => {
            document.removeEventListener('mousedown', handleClickForProfileMenu);
        }
    }, []);

    // if not logged in, show sign in link

    if (!authContextData.isLoggedIn()) {
        return <a href={ROUTES.LOGIN}>Sign in</a>;
    }

    // otherwise, render profile icon + menu

    const profileMenuStyle: React.CSSProperties = {
        visibility: isProfileMenuVisible ? "visible" : "hidden"
    };

    return (
        <>
            <a className="h-full flex-col justify-center items-center aspect-square cursor-pointer" 
               ref={profileIconRef}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                        className="lucide lucide-user" aria-hidden="true">

                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </a>
            <div ref={profileMenuRef} className="fixed bg-secondary rounded-sm top-[calc(var(--navbar-height)+15px)] p-4 flex flex-col" 
                style={profileMenuStyle}>
                <a href={ROUTES.PROFILE}>Profile</a>
                <a onClick={ async () => { await signOut(); navigate(ROUTES.HOME); } } className="cursor-pointer">Log out</a>
            </div>
        </>
    )
}