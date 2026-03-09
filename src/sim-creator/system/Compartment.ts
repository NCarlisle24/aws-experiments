import type { TransitionId } from './Transition.ts';

export type CompartmentId = number;

export interface Compartment {
    readonly id:          CompartmentId;
    readonly name:        string;
    readonly x:           number;
    readonly y:           number;
    readonly transitions: readonly TransitionId[]; // REACT STRICT MODE REQUIRES PURE FUNCTIONS SO I GUESS WE'RE DOING DB NORMALIZATION NOW
}

export const create = (name: string, x: number, y: number, id: CompartmentId): Compartment => ({
    id,
    name,
    x,
    y,
    transitions: []
});

export const addTransition = (compartment: Compartment, transition: TransitionId): Compartment => {
    return {
        ...compartment,
        transitions: [ ...compartment.transitions, transition ]
    };
}

export const removeTransition = (compartment: Compartment, transitionId: TransitionId): Compartment => {
    return {
        ...compartment,
        transitions: [...compartment.transitions].filter(id => id !== transitionId)
    };
}