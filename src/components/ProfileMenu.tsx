import React, { type CSSProperties } from 'react';
import { signOut } from 'aws-amplify/auth'; 
import { useNavigate } from 'react-router';

import ROUTES from '../routes.ts';

interface ProfileMenuProps {
    isVisible: Boolean,
}

const ProfileMenu = React.forwardRef<HTMLDivElement, ProfileMenuProps>(({ isVisible }: ProfileMenuProps, ref) => {
    const navigate = useNavigate();

    const style: CSSProperties = {
        visibility: isVisible ? "visible" : "hidden"
    };

    return (
        <div ref={ref} className="fixed bg-secondary rounded-sm top-[calc(var(--navbar-height)+15px)] p-4 flex flex-col" 
             style={style}>
            <a href={ROUTES.PROFILE}>Profile</a>
            <a onClick={ async () => { await signOut(); navigate(ROUTES.HOME); } } className="cursor-pointer">Log out</a>
        </div>
    );
});

export default ProfileMenu;