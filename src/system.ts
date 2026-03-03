import { createBrowserRouter } from 'react-router';
import ROUTES from './routes.ts';
import MainLayout from './MainLayout.tsx';
import App from './components/App.tsx';
import SignIn from './components/LoginPage.tsx'

export const router = createBrowserRouter([
    {
        Component: MainLayout,
        children: [
            {
                path: ROUTES.HOME,
                Component: App
            },
            {
                path: ROUTES.LOGIN,
                Component: SignIn
            }
        ]
    }
])