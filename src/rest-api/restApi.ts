import { AuthContextData } from '../auth';

export type RestApiFunction = (authContextData: AuthContextData, ...args: any[]) => any;

const restApi = (() => {
    const getUserProjects: RestApiFunction = (authContextData: AuthContextData) => {
        if (!authContextData.isLoggedIn()) {
            return null;
        }

        return true;
    }

    return {
        getUserProjects
    };
})();

export default restApi;