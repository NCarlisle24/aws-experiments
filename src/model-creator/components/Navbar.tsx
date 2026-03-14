import { ROUTES } from '../../router.tsx';
import { useModelCreator } from '../ModelCreatorContext.ts';
import ProfileIcon from '../../components/ProfileIcon.tsx';
import NavLink from '../../components/NavLink.tsx';

import React from 'react';

export default function ModelCreatorNavbar() {
    const modelNameRef = React.useRef<HTMLInputElement>(null);

    const { model, setModelName } = useModelCreator();

    const submitModelName = () => {
        if (modelNameRef.current === null) return;
        modelNameRef.current.blur();

        const newName = modelNameRef.current.value;

        setModelName(newName);
    }

    return (
        <div className="sticky top-0 z-1024 shadow-md h-(--navbar-height) flex justify-between items-center 
                        px-6 py-5 bg-secondary">

            <div className="flex items-center text-xl font-bold">
                <input defaultValue={model.modelName} 
                       onBlur={submitModelName} 
                       onKeyDown={ (e) => { if (e.key === 'Enter') submitModelName(); } } 
                       ref={modelNameRef} type="text"></input>
            </div>


            <div className="flex gap-6 h-full">
                <NavLink dest={ROUTES.HOME}>Home</NavLink>
                <NavLink dest={ROUTES.USER_MODELS}>Models</NavLink>

                <ProfileIcon />
            </div>
        </div>
    )
}