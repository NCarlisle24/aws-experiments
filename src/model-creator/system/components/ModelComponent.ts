// component type enum

import type { Compartment } from "./Compartment";
import type { Transition } from "./Transition";

const COMPONENT_TYPES = {
    UNKNOWN: "Unknown",
    COMPARTMENT: "Compartment",
    TRANSITION: "Transition",
} as const;

export type ModelComponentType = typeof COMPONENT_TYPES[keyof typeof COMPONENT_TYPES];

export const ModelComponentType = {
    ...COMPONENT_TYPES
} as const;

// model component interface

export type ModelComponentId = number;

export interface BaseModelComponent {
    readonly id: ModelComponentId,
    readonly type: ModelComponentType,
};

export const createComponent = (
    id: ModelComponentId,
    type: ModelComponentType = ModelComponentType.UNKNOWN
): BaseModelComponent => {
    return { id, type };
}

interface Unknown extends BaseModelComponent {
    type: "Unknown"
};

export type ModelComponent = Compartment | Transition | Unknown;
