import { Loader } from '@aws-amplify/ui-react';
import React from 'react';
import restApi from '../../rest-api';
import { useSimCreator } from '../SimContext';
import { useAuth } from '../../auth';

export default function SaveButton() {
    const [isSaving, setIsSaving] = React.useState<boolean>(false);

    const { model, projectId } = useSimCreator();
    const authContextData = useAuth();

    const cursor = isSaving ? "" : "pointer";

    const handleClick = async () => {
        if (!isSaving) {
            setIsSaving(true);
            await restApi.setProjectModel(authContextData, projectId, model);
            setIsSaving(false);
        }
    }

    return (
        <div className="bg-quaternary px-3 py-2 flex justify-center items-center text-center rounded-sm" style={{ cursor }}
             onClick={handleClick}>
            { isSaving ? 
                <div className="flex gap-2 justify-between items-center">
                    <span>Saving...</span> 
                    <Loader />
                </div> 
            : 
                <>Save</> 
            }
        </div>
    );
}