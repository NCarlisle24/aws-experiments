import { ROUTES } from "../router";
import restApi from "../rest-api";
import { useAuth } from "../auth";

import { useNavigate } from "react-router";
import React from 'react';
import { Loader } from "@aws-amplify/ui-react";

export default function CreateModelButton() {
    const navigate = useNavigate();
    const authContextData = useAuth();
    const [isCreating, setIsCreating] = React.useState<boolean>(false);

    const handleCreateModel = async () => {
        setIsCreating(true);
        const modelId = await restApi.createUserModel(authContextData);
        if (modelId) navigate(ROUTES.MODEL_CREATOR + "/" + modelId);
    }

    const cursor = isCreating ? "wait" : "pointer";

    return (
        <a className="bg-[#8dc51a] hover:bg-[#6c9714] p-3 rounded-sm flex justify-center items-center text-center"
            onClick={isCreating ? undefined : handleCreateModel} style={{ cursor }}>
            {isCreating ? 
                <div className="flex gap-2 items-center">
                    Creating model...
                    <Loader />
                </div>
            :
                <>Create model</>
            }
        </a>
    );
}