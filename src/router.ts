// routes

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    PROFILE: '/profile',
    ADMIN: '/admin',
    PROJECTS: '/projects',
    NEW_PROJECT: '/new-project',
    SIM_CREATOR: '/edit-sim'
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];

// router

import { createBrowserRouter } from 'react-router';

import { RequireAuth } from './auth/index.ts';
import MainLayout from './MainLayout.tsx';
import Home from './pages/Home.tsx';
import SignIn from './pages/LoginPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import ProjectsPage from './pages/ProjectsPage.tsx';
import CreateProjectPage from './pages/CreateProjectPage.tsx';
import SimCreatorPage from './pages/SimCreatorPage.tsx';

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
                    },
                ]
            }
        ],
    },
    {
        Component: RequireAuth,
            children: [
            {
                path: ROUTES.SIM_CREATOR,
                Component: SimCreatorPage
            }
        ]
    }
]);