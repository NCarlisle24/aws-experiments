const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    PROFILE: '/profile',
    ADMIN: '/admin',
    PROJECTS: '/projects',
    NEW_PROJECT: '/new-project'
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];

export default ROUTES;