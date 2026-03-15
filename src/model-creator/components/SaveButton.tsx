import { Loader } from '@aws-amplify/ui-react';
import React from 'react';
import restApi from '../../rest-api';
import { useModelCreator, type ModelCreatorContextData } from '../ModelCreatorContext';
import { useAuth } from '../../auth';

const contextDataSelector = (data: ModelCreatorContextData) => ({
    model: data.model!
});

export default function SaveButton() {
    const [isSaving, setIsSaving] = React.useState<boolean>(false);

    const { model } = useModelCreator(contextDataSelector);
    const authContextData = useAuth();

    const cursor = isSaving ? "" : "pointer";

    const handleClick = async () => {
        if (!isSaving) {
            setIsSaving(true);
            await restApi.updateUserModel(authContextData, model);
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