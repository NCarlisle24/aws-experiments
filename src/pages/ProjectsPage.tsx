import { useAuth } from '../auth';
import restApi from '../rest-api/';
import { type Project, type ProjectId } from '../../amplify/data/tables.ts';

import React from 'react';
import LargeLoader from '../components/LargeLoader.tsx';
import CreateProjectButton from '../components/CreateProjectButton.tsx';
import ProjectEntry from '../components/ProjectEntry.tsx';

export default function ProjectsPage() {
    const [projects, setProjects] = React.useState<Project[] | null>(null);

    const authContextData = useAuth();

    React.useEffect(() => {
        (async () => {
            const fetchedProjects = await restApi.getUserProjects(authContextData);
            setProjects(fetchedProjects);
        })();
    }, []);

    const createProjectEntryDeleteHandler = (projectId: ProjectId) => {
        return () => setProjects(prev => {
            if (prev === null) return null;
            return prev.filter(project => project.project_id !== projectId);
        });
    }

    return (
        <div className="h-full w-full">
            <CreateProjectButton />
            <div className="flex flex-col w-full my-5 p-5 gap-2 rounded-sm bg-secondary">
                {projects === null ?  <LargeLoader />
                : projects.length == 0 ?  <div className="w-full text-center">(no projects to display)</div>
                : projects.map((project) => <ProjectEntry project={project} key={project.project_id} 
                                                          onDelete={createProjectEntryDeleteHandler(project.project_id)} />
                )}
            </div>
        </div>
    );
}