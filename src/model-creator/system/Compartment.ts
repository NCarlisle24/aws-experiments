import type { TransitionId } from './Transition.ts';
import type { DbCompartment, CompartmentId } from '../../../amplify/data/tables.ts';
import type { Focusable } from './Focus.ts';

export interface Compartment extends DbCompartment, Focusable { };

export type { CompartmentId };

export const create = (name: string, x: number, y: number, id: CompartmentId): Compartment => ({
    id,
    name,
    x,
    y,
    outTransitions: [],
    inTransitions: [],
});

export const addOutTransition = (compartment: Compartment, transition: TransitionId): Compartment => {
    return {
        ...compartment,
        outTransitions: [ ...compartment.outTransitions, transition ]
    };
}

export const addInTransition = (compartment: Compartment, transition: TransitionId): Compartment => {
    return {
        ...compartment,
        inTransitions: [ ...compartment.inTransitions, transition ]
    }
}

export const removeOutTransition = (compartment: Compartment, transition: TransitionId): Compartment => {
    if (!compartment.outTransitions.includes(transition)) return compartment;

    return {
        ...compartment,
        outTransitions: [...compartment.outTransitions].filter(id => id !== transition)
    };
}

export const removeInTransition = (compartment: Compartment, transition: TransitionId): Compartment => {
    if (!compartment.inTransitions.includes(transition)) return compartment;

    return {
        ...compartment,
        inTransitions: [...compartment.inTransitions].filter(id => id !== transition)
    };
}

export const convertToDbCompartment = (compartment: Compartment): DbCompartment => {
    const { ...dbCompartment} = compartment;
    return dbCompartment;
}

export const convertFromDbCompartment = (dbCompartment: DbCompartment): Compartment => {
    return {
        ...dbCompartment,
    };
}