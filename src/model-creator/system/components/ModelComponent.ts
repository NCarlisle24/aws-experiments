// component type enum

const COMPONENT_TYPES = {
    UNKNOWN: "unknown",
    COMPARTMENT: "compartment",
    TRANSITION: "transition",
} as const;

export type ModelComponentType = typeof COMPONENT_TYPES[keyof typeof COMPONENT_TYPES];

export const ModelComponentType = {
    ...COMPONENT_TYPES
} as const;

// model component interface

export type ModelComponentId = number;

export interface ModelComponent {
    readonly id: ModelComponentId,
    readonly type: ModelComponentType,
};

export const createComponent = (
    id: ModelComponentId,
    type: ModelComponentType = ModelComponentType.UNKNOWN
): ModelComponent => {
    return { id, type };
}