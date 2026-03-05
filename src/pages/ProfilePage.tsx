import { useAuth } from "../auth";

export default function ProfilePage() {
    const authContextData = useAuth();
    const userGroups = authContextData.getUserGroups();

    return (
        <div>
            <h1 className="title">User information</h1>
            <span className="font-bold">Email:</span> <span>{authContextData.getUserEmail()}</span><br />
            <span className="font-bold">Groups:</span> <span>{userGroups.length > 0 ? 
                                                                   JSON.stringify(userGroups) 
                                                                   : "(none)"}</span> <br />
            <span className="font-bold">User ID:</span> <span>{authContextData.getUserId()}</span><br />
            <span className="font-bold">Identity ID:</span> <span>{authContextData.getIdentityId()}</span>
        </div>
    )

}