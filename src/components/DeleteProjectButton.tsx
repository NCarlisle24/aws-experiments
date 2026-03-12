import React from 'react';
import type { Project } from '../../amplify/data/tables';
import { useAuth } from '../auth';
import restApi from '../rest-api';
import { Loader } from '@aws-amplify/ui-react';

interface DeleteButtonProps {
    onClick?: (e: React.MouseEvent) => any;
    children: React.ReactNode;
    style?: React.CSSProperties;
}

function DeleteButton({ onClick, children, style }: DeleteButtonProps) {
     return (
        <div className="p-2 rounded-sm bg-[#9e1515] hover:bg-[#700e0e] text-center cursor-pointer"
                onClick={onClick} style={style}>
            {children}
        </div>
    );
}


interface DeleteProjectButtonProps {
    project: Project,
    onDelete?: () => any,
    afterDelete?: () => any
}

export default function DeleteProjectButton({ project, onDelete, afterDelete }: DeleteProjectButtonProps) {
    const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
    const [isConfirming, setIsConfirming] = React.useState<boolean>(false);
    const confirmationMenuRef = React.useRef<HTMLDivElement>(null);

    const authContextData = useAuth();

    const showConfirmationMenu = (e: React.MouseEvent) => {
        if (isConfirming || isDeleting) return;
        e.stopPropagation(); // stop the confirmation menu click handler from running
        setIsConfirming(true);
    }

    const hideConfirmationMenu = () => {
        setIsConfirming(false);
    }

    React.useEffect(() => {
        const checkForClickOutsideOfConfirmationMenu = (e: MouseEvent) => {
            if (isConfirming && confirmationMenuRef.current 
                && !confirmationMenuRef.current.contains(e.target as Node)) 
            {
                hideConfirmationMenu();
            }
        }

        window.addEventListener('click', checkForClickOutsideOfConfirmationMenu);

        return () => window.removeEventListener('click', checkForClickOutsideOfConfirmationMenu);
    }, [hideConfirmationMenu]);

    const deleteProject = async () => {
        setIsConfirming(false);
        setIsDeleting(true);

        if (onDelete) onDelete();

        await restApi.deleteUserProject(authContextData, project.project_id);
        
        if (afterDelete) afterDelete();
    }

    if (isConfirming) return (
        <>
            <DeleteButton>Delete</DeleteButton>
            <div className="w-screen h-screen fixed top-0 left-0 z-2048 backdrop-blur-xs flex 
                            items-center justify-center cursor-default">
                <div className="p-3 bg-light-secondary rounded-md h-25 flex flex-col shadow-lg" ref={confirmationMenuRef}>
                    Are you sure you want to delete "{project.projectName}"?
                    <div className="mt-auto flex gap-2 self-end">
                        <div className="p-2 rounded-sm bg-secondary hover:bg-light-secondary text-center cursor-pointer"
                                onClick={hideConfirmationMenu}>
                            Cancel
                        </div>
                        <DeleteButton onClick={deleteProject}>Delete</DeleteButton>
                    </div>
                </div>
            </div>
        </>
    );

    const cursor = isDeleting ? "wait" : "pointer";

    return (
        <DeleteButton onClick={showConfirmationMenu} style={{ cursor }}>
            {isDeleting ? 
                    <div className="flex gap-2 items-center">
                        Deleting...
                        <Loader />
                    </div>
                :
                    <>Delete</>
            }
        </DeleteButton>
    );
}