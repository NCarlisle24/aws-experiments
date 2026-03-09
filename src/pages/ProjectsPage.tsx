import { useAuth } from '../auth';
import { ROUTES } from '../router.ts';

export default function ProjectsPage() {
    const authContextData = useAuth();

    return (
        <div>
            <div className="flex justify-between">
                <h1 className="title">Projects</h1>
                <a className="bg-quaternary p-3 rounded-sm flex justify-center items-center text-center"
                   href={ROUTES.NEW_PROJECT}>
                    <p>Create project</p>
                </a>
            </div>
            <div className="grid grid-cols-4">

            </div>
        </div>
    );
}