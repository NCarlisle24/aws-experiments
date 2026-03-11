import type { TransitionId } from './Transition.ts';
import type { Compartment, CompartmentId } from '../../../amplify/data/tables.ts';

export { type Compartment, type CompartmentId };

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