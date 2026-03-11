import React from 'react';
import type { Project } from '../../amplify/data/tables';
import { useAuth } from '../auth';
import restApi from '../rest-api';
import { Loader } from '@aws-amplify/ui-react';

interface DeleteProjectButtonProps {
    project: Project,
    onDelete?: () => any
}

export default function DeleteProjectButton({ project, onDelete }: DeleteProjectButtonProps) {
    const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

    const authContextData = useAuth();

    const deleteProject = async () => {
        setIsDeleting(true);
        if (onDelete) onDelete();
        // await restApi.deleteUserProject(authContextData, project.project_id);
    }

    const cursor = isDeleting ? "wait" : "pointer";

    return (
        <div className="p-2 rounded-sm bg-[#9e1515] hover:bg-[#700e0e] text-center cursor-pointer"
            onClick={isDeleting ? undefined : deleteProject} style={{ cursor }}>
                {isDeleting ? 
                        <div className="flex gap-2 items-center">
                            Deleting...
                            <Loader />
                        </div>
                    :
                        <>Delete</>
                }
        </div>
    );
}