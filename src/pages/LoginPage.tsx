import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useNavigate } from 'react-router';
import React from 'react';

import ROUTES from '../routes.ts';
import { useAuth, AuthStatus } from '../auth/index.ts';
import LargeLoader from '../components/LargeLoader.tsx';

export default function LoginPage() {
    const authContextData = useAuth();
    const authStatus = authContextData.getStatus();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (AuthStatus.isEqual(authStatus, AuthStatus.LOGGED_IN)) {
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