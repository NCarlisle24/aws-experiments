const VALUES = {
    SELECT: "select",
    CREATE_COMPARTMENT: "create compartment",
    MOVE_COMPARTMENT: "move compartment",
    CREATE_TRANSITION: "create transition"
} as const;

type ModeKey = keyof typeof VALUES;
export type Mode = typeof VALUES[ModeKey];

export const Mode = (() => {
    const isEqual = (mode1: Mode, mode2: Mode): boolean => {
        return (mode1 === mode2);
    };

    return {
        ...VALUES,
        DEFAULT: VALUES.SELECT,
        isEqual
    }
})();