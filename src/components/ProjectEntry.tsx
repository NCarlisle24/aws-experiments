import type { Project } from "../../amplify/data/tables";
import { ROUTES } from "../router";
import DeleteProjectButton from "./DeleteProjectButton";

import React from 'react';

interface ProjectEntryProps {
    project: Project
};

export default function ProjectEntry({ project }: ProjectEntryProps) {
    const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

    const cursor = isDeleting ? "wait" : "pointer";

    return (
        <div className="relative top-0 left-0">
            <a className="flex justify-start w-full min-h-30 hover:bg-light-secondary rounded-lg p-4"
               style={{ cursor }}
               href={isDeleting ? undefined : ROUTES.SIM_CREATOR + "/" + project.project_id}>
                <div className="flex flex-col justify-start">
                    <div className="text-xl font-bold">{project.name}</div>
                    <div className="text-subtitle-on-secondary">{project.project_id}</div>
                    <div className="text-subtitle-on-secondary">Last modified: {project.lastModifiedAt}</div>
                </div>
            </a>
            <div className="absolute flex flex-col justify-center top-4 right-4">
                <DeleteProjectButton project={project} onDelete={() => setIsDeleting(true)}/>
            </div>
        </div>
    );
}