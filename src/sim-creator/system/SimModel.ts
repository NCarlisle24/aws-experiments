import type { Compartment, CompartmentId } from "./Compartment";
import type { Transition, TransitionId } from "./Transition";
import * as CompartmentLib from "./Compartment";

export type SimModelId = number;

export interface SimModel {
    readonly id:           SimModelId;
    readonly compartments: ReadonlyMap<CompartmentId, Compartment>;
    readonly transitions:  ReadonlyMap<TransitionId, Transition>;
};

export const create = (id: SimModelId = 0): SimModel => ({
    id,
    compartments: new Map(),
    transitions: new Map()
});

export const setId = (model: SimModel, id: SimModelId): SimModel => ({
    ...model,
    id
});

export const hasCompartmentWithId = (model: SimModel, id: CompartmentId): boolean => {
    return (model.compartments.has(id));
}

export const hasTransitionWithId = (model: SimModel, id: TransitionId): boolean => {
    return (model.transitions.has(id));
}

export const getCompartmentWithId = (model: SimModel, id: CompartmentId): Compartment | null => {
    if (!hasCompartmentWithId(model, id)) return null;
    return model.compartments.get(id)!;
}

export const getTransitionWithId = (model: SimModel, id: TransitionId): Transition | null => {
    if (!hasTransitionWithId(model, id)) return null;
    return model.transitions.get(id)!;
}

export const addCompartment = (model: SimModel, compartment: Compartment): SimModel => {
    // the added compartment cannot have existing transitions
    if (hasCompartmentWithId(model, compartment.id) || compartment.transitions.length > 0) return model;

    return {
        ...model,
        compartments: new Map([...model.compartments, [compartment.id, compartment]])
    };
}

export const addTransition = (model: SimModel, transition: Transition): SimModel => 
{
    // rules: 
    // - both compartments need to exist in the model
    // - compartments must be unique
    // - an equivalent transition cannot already exist

    if (hasTransitionWithId(model, transition.id)) return model;

    const startId = transition.start;
    const endId = transition.end;
    const start = getCompartmentWithId(model, startId);
    const end = getCompartmentWithId(model, endId);

    if (!start || !end || startId === endId) return model;

    for (const existingTransitionId of start.transitions) {
        const currTransition = getTransitionWithId(model, existingTransitionId)!;
        if (currTransition.end === endId) return model;
    }

    // tests passed; can connect transition

    const newCompartments = new Map(model.compartments);

    newCompartments.set(startId, CompartmentLib.addTransition(start, transition.id));
    newCompartments.set(endId, CompartmentLib.addTransition(end, transition.id));

    const newTransitions = new Map(model.transitions);
    newTransitions.set(transition.id, transition);

    return {
        ...model,
        compartments: newCompartments,
        transitions: newTransitions
    };

}

export const removeTransition = (model: SimModel, id: TransitionId): SimModel => {
    const transition = getTransitionWithId(model, id);
    if (!transition) return model;

    const startId = transition.start;
    const endId = transition.end;
    const start = getCompartmentWithId(model, startId)!;
    const end = getCompartmentWithId(model, endId)!;

    const newTransitions = new Map(model.transitions);
    newTransitions.delete(id);

    const newCompartments = new Map(model.compartments);

    newCompartments.set(startId, CompartmentLib.removeTransition(start, id));
    newCompartments.set(endId, CompartmentLib.removeTransition(end, id));

    return {
        ...model,
        compartments: newCompartments,
        transitions: newTransitions
    };
}

export const removeCompartment = (model: SimModel, id: CompartmentId): SimModel => {
    const compartment = getCompartmentWithId(model, id);
    if (!compartment) return model;

    const transitionIdsToRemove = compartment.transitions;
    for (const idToRemove of transitionIdsToRemove) {
        model = removeTransition(model, idToRemove);
    }

    const newCompartments = new Map(model.compartments);
    newCompartments.delete(id);

    const newModel: SimModel = {
        ...model,
        compartments: newCompartments
    };

    return newModel;
}

export const updateCompartment = (model: SimModel, id: CompartmentId, updates: Partial<Compartment>): SimModel => {
    const prevCompartment = getCompartmentWithId(model, id);
    if (!prevCompartment) return model;

    const newCompartments = new Map(model.compartments);
    newCompartments.set(prevCompartment.id, { ...prevCompartment, ...updates });

    return {
        ...model,
        compartments: newCompartments
    };
}

export const print = (model: SimModel): void => {
    let message = `\nPrinting model with ID ${model.id}:\n\nCOMPARTMENTS\n\n`;

    if (model.compartments.size == 0) {
        message += "(none)\n\n";
    }

    for (const compartment of model.compartments.values()) {
        message += `"${compartment.name}" (ID = ${compartment.id}).`;

        if (compartment.transitions.length == 0) {
            message += `\n- (no transitions)`;
        }

        for (const transitionId of compartment.transitions) {
            const transition = getTransitionWithId(model, transitionId)!;
            const start = getCompartmentWithId(model, transition.start)!;
            const end = getCompartmentWithId(model, transition.end)!;

            if (start.id === compartment.id) {
                message += `\n- Can go to "${end.name}" (ID = ${end.id}, transition ID = ${transitionId})`;
            } else {
                message += `\n- Can come from "${start.name}" (ID = ${start.id}, transition ID = ${transitionId})`;
            }
        }

        message += "\n\n";
    }

    message += "\nTRANSITIONS\n\n";

    if (model.transitions.size == 0) {
        message += "(none)\n";
    }

    for (const transition of model.transitions.values()) {
        const start = getCompartmentWithId(model, transition.start)!;
        const end = getCompartmentWithId(model, transition.end)!;
        message += `ID ${transition.id} connects "${start.name}" (ID = ${start.id}) to "${end.name}" (ID = ${end.id}).\n`;
    }

    message += "\n";
    
    console.log(message);
}