import { ROUTES } from '../../router.tsx';
import { useAuth } from '../../auth/index.ts';
import { useSimCreator } from '../SimContext.ts';
import ProfileIcon from '../../components/ProfileIcon.tsx';
import ProfileMenu from '../../components/ProfileMenu.tsx';
import NavLink from '../../components/NavLink.tsx';
import restApi from '../../rest-api/restApi.ts';

import React from 'react';

export default function SimCreatorNavbar() {
    const [profileMenuIsVisible, setProfileMenuVisibility] = React.useState<Boolean>(false);
    const profileIconRef = React.useRef<HTMLAnchorElement>(null);
    const profileMenuRef = React.useRef<HTMLDivElement>(null);
    const projectNameRef = React.useRef<HTMLInputElement>(null);

    const authContextData = useAuth();

    const { projectName: initialProjectName, projectId } = useSimCreator();

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

    const submitProjectName = () => {
        if (projectNameRef.current === null) return;
        projectNameRef.current.blur();

        const newName = projectNameRef.current.value;

        if (newName === initialProjectName) {
            console.log("name is same as before!");
            return;
        }

        console.log("submitting name '" + projectNameRef.current.value + "'");

        restApi.setProjectName(authContextData, projectId, newName);
    }

    React.useEffect(() => {
        document.addEventListener('mousedown', handleClickForProfileMenu);
        return () => {
            document.removeEventListener('mousedown', handleClickForProfileMenu);
        }
    }, []);

    return (
        <div className="sticky top-0 z-1024 shadow-md h-(--navbar-height) flex items-center 
                        px-6 py-5 bg-secondary">

            <div className="flex items-center text-xl font-bold">
                <input defaultValue={initialProjectName} onBlur={submitProjectName} 
                       onKeyDown={ (e) => { if (e.key === 'Enter') submitProjectName(); } } 
                       ref={projectNameRef} type="text"></input>
            </div>

            <div className="flex items-center justify-end ml-auto gap-6 h-full">
                <NavLink dest={ROUTES.HOME}>Home</NavLink>
                <NavLink dest={ROUTES.PROJECTS}>Projects</NavLink>

                {!authContextData.isLoggedIn() ?
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

        </div>
    )
}