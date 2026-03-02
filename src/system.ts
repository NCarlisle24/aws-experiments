import { createBrowserRouter } from 'react-router';
import MainLayout from './MainLayout.tsx';
import App from './components/App.tsx';
import SignIn from './auth/SignIn.tsx'

export const router = createBrowserRouter([
    {
        Component: MainLayout,
        children: [
            {
                path: "/app",
                Component: App
            },
            {
                path: "/login",
                Component: SignIn
            }
        ]
    }
])