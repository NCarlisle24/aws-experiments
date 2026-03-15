import type { DbCompartment } from '../../../../amplify/data/tables.ts';

import * as ModelComponentLib from './ModelComponent.ts'

export interface Compartment extends ModelComponentLib.ModelComponent {
    readonly name: string,
    readonly x: number,
    readonly y: number,
    readonly inTransitions: ReadonlySet<ModelComponentLib.ModelComponentId>,
    readonly outTransitions: ReadonlySet<ModelComponentLib.ModelComponentId>,
};

export const createCompartment = (
    id: ModelComponentLib.ModelComponentId,
    name: string,
    x: number = 0,
    y: number = 0
): Compartment => {
    const newComponent = ModelComponentLib.createComponent(
        id, 
        ModelComponentLib.ModelComponentType.COMPARTMENT
    );

    const newCompartment: Compartment = {
        ...newComponent,
        name,
        x,
        y,
        outTransitions: new Set(),
        inTransitions: new Set(),
    };

    return newCompartment;
};

export const addOutTransition = (
    compartment: Compartment,
    transitionId: ModelComponentLib.ModelComponentId
): Compartment => {
    if (compartment.outTransitions.has(transitionId)) return compartment;

    const newOutTransitions = new Set(compartment.outTransitions);
    newOutTransitions.add(transitionId);

    return {
        ...compartment,
        outTransitions: newOutTransitions
    };
}

export const addInTransition = (
    compartment: Compartment,
    transitionId: ModelComponentLib.ModelComponentId
): Compartment => {
    if (compartment.inTransitions.has(transitionId)) return compartment;

    const newInTransitions = new Set(compartment.inTransitions);
    newInTransitions.add(transitionId);

    return {
        ...compartment,
        inTransitions: newInTransitions
    };
}

export const removeOutTransition = (
    compartment: Compartment,
    transitionId: ModelComponentLib.ModelComponentId
): Compartment => {
    if (!compartment.outTransitions.has(transitionId)) return compartment;

    const newOutTransitions = new Set(compartment.outTransitions);
    newOutTransitions.delete(transitionId);

    return {
        ...compartment,
        outTransitions: newOutTransitions
    };
}

export const removeInTransition = (
    compartment: Compartment,
    transitionId: ModelComponentLib.ModelComponentId
): Compartment => {
    if (!compartment.inTransitions.has(transitionId)) return compartment;

    const newInTransitions = new Set(compartment.inTransitions);
    newInTransitions.delete(transitionId);

    return {
        ...compartment,
        inTransitions: newInTransitions
    };
}

export const convertToDbCompartment = (compartment: Compartment): DbCompartment => {
    const dbCompartment: DbCompartment = {
        id:             compartment.id,
        name:           compartment.name,
        x:              compartment.x,
        y:              compartment.y,
        outTransitions: Array.from(compartment.outTransitions),
        inTransitions:  Array.from(compartment.inTransitions),
    }

    return dbCompartment;
}

export const convertFromDbCompartment = (dbCompartment: DbCompartment): Compartment => {
    const newComponent = ModelComponentLib.createComponent(
        dbCompartment.id,
        ModelComponentLib.ModelComponentType.COMPARTMENT
    );

    const newCompartment: Compartment = {
        ...newComponent,
        name: dbCompartment.name,
        x: dbCompartment.x,
        y: dbCompartment.y,
        inTransitions: new Set(dbCompartment.inTransitions),
        outTransitions: new Set(dbCompartment.outTransitions),
    };

    return newCompartment;
}