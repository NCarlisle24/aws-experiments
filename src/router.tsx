import { Navigate } from 'react-router';

// routes

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    PROFILE: '/profile',
    ADMIN: '/admin',
    USER_MODELS: '/models',
    MODEL_CREATOR: '/edit'
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];

// router

import { createBrowserRouter } from 'react-router';

import { RequireAuth } from './auth/index.ts';
import MainLayout from './MainLayout.tsx';
import Home from './pages/Home.tsx';
import SignIn from './pages/LoginPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import UserModelsPage from './pages/UserModelsPage.tsx';
import ModelCreatorPage from './pages/ModelCreatorPage.tsx';

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
                        path: ROUTES.USER_MODELS,
                        Component: UserModelsPage
                    },
                ]
            }
        ],
    },
    {
        Component: RequireAuth,
            children: [
                {
                    path: ROUTES.MODEL_CREATOR,
                    element: <Navigate to={ROUTES.USER_MODELS} replace />
                },
                {
                    path: ROUTES.MODEL_CREATOR + "/:modelId",
                    Component: ModelCreatorPage
                }
            ]
    }
]);