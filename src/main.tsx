// react imports
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// router imports
import { router } from './system.ts';
import { RouterProvider } from 'react-router-dom';

// auth imports
import { Authenticator } from '@aws-amplify/ui-react';
import AuthBridge from './auth/AuthBridge.tsx';
import { authManager } from './auth/manager.tsx';

// amplify outputs imports
import { Amplify } from 'aws-amplify';
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Authenticator.Provider>
            <AuthBridge>
                <RouterProvider router={router} />
            </AuthBridge>
        </Authenticator.Provider>
    </StrictMode>,
);
