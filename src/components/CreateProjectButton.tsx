import { ROUTES } from "../router";
import restApi from "../rest-api";
import { useAuth } from "../auth";

import { useNavigate } from "react-router";
import React from 'react';
import { Loader } from "@aws-amplify/ui-react";

export default function CreateProjectButton() {
    const navigate = useNavigate();
    const authContextData = useAuth();
    const [isCreating, setIsCreating] = React.useState<boolean>(false);

    const handleCreateProject = async () => {
        setIsCreating(true);
        const projectId = await restApi.createUserProject(authContextData);
        if (projectId) navigate(ROUTES.SIM_CREATOR + "/" + projectId);
    }

    const cursor = isCreating ? "wait" : "pointer";

    return (
        <div className="flex justify-between">
            <h1 className="title">Projects</h1>
            <a className="bg-[#8dc51a] hover:bg-[#6c9714] p-3 rounded-sm flex justify-center items-center text-center"
                onClick={isCreating ? undefined : handleCreateProject} style={{ cursor }}>
                {isCreating ? 
                    <div className="flex gap-2 items-center">
                        Creating project...
                        <Loader />
                    </div>
                :
                    <>Create project</>
                }
            </a>
        </div>
    );
}