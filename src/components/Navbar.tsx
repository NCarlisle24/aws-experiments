import { useAuthenticator } from '@aws-amplify/ui-react';
import { signOut } from 'aws-amplify/auth';

export default function Navbar() {
    const { authStatus } = useAuthenticator((ctx) => [ ctx.authStatus ]);

    return (
        <div className="sticky top-0 z-1024 bg-white shadow-md h-25">
            {authStatus == 'authenticated' ? 
                <a onClick={ async () => { await signOut() } }>
                    Sign out
                </a> : 
                <a>
                    Sign in
                </a>
            }
        </div>
    )
}