import { Authenticator, Loader } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export default function SignIn() {
    return (
        <Authenticator className="w-fit mx-auto">
            <Loader variation="linear" />
        </Authenticator>
    );
}