import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

// import { useAuth } from '../auth';
import LargeLoader from './LargeLoader';

export default function LoginPage() {
    // TODO: if the user is logged in, navigate to the home page

    return (
        <div className="flex justify-center items-center h-full">
            <Authenticator className="w-fit">
                <LargeLoader></LargeLoader>
            </Authenticator>
        </div>
    );
}