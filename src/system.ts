import { createBrowserRouter } from 'react-router';

import ROUTES from './routes.ts';
import { RequireAuth } from './auth';
import MainLayout from './MainLayout.tsx';
import Home from './pages/Home.tsx';
import SignIn from './pages/LoginPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import ProjectsPage from './pages/ProjectsPage.tsx';
import CreateProjectPage from './pages/CreateProjectPage.tsx';

export const router = createBrowserRouter([
    {
        Component: MainLayout,
        children: [
            {
                path: ROUTES.HOME,
                Component: Home
            },
            {
                path: ROUTES.LOGIN,
                Component: SignIn
            },
            {
                Component: RequireAuth,
                children: [
                    {
                        path: ROUTES.PROFILE,
                        Component: ProfilePage
                    },
                    {
                        path: ROUTES.PROJECTS,
                        Component: ProjectsPage
                    },
                    {
                        path: ROUTES.NEW_PROJECT,
                        Component: CreateProjectPage
                    }
                ]
            }
        ]
    }
])