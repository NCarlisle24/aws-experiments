import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useNavigate } from 'react-router';
import React from 'react';

import { ROUTES } from '../router.ts';
import { useAuth } from '../auth/index.ts';
import LargeLoader from '../components/LargeLoader.tsx';

export default function LoginPage() {
    const authContextData = useAuth();
    const authStatus = authContextData.getStatus();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (authContextData.isLoggedIn()) {
            navigate(ROUTES.HOME);
        }
    }, [navigate, authStatus]);

    return (
        <div className="flex justify-center items-center h-full">
            <Authenticator className="w-fit">
                <LargeLoader></LargeLoader>
            </Authenticator>
        </div>
    );
}