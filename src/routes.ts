const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    PROFILE: '/profile',
    ADMIN: '/admin'
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];

export default ROUTES;