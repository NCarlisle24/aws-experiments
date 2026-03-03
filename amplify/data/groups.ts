export const USER_GROUPS = {
    ADMIN: "admin",
    VIEWER: "viewer"
} as const;

export type UserGroup = typeof USER_GROUPS[keyof typeof USER_GROUPS];