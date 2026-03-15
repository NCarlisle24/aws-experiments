import type { Compartment, CompartmentId } from "./Compartment";
import type { Transition, TransitionId } from "./Transition";
import * as CompartmentLib from "./Compartment";
import * as TransitionLib from "./Transition";

import type { DbModel, ModelId } from '../../../amplify/data/tables';

export { type ModelId };
export interface Model extends Omit<Omit<DbModel, "compartments">, "transitions"> {
    compartments: ReadonlyMap<CompartmentId, Readonly<Compartment>>,
    transitions: ReadonlyMap<TransitionId, Readonly<Transition>>
};

export const hasCompartmentWithId = (model: Model, id: CompartmentId): boolean => {
    return (model.compartments.has(id));
}

export const hasTransitionWithId = (model: Model, id: TransitionId): boolean => {
    return (model.transitions.has(id));
}

export const getCompartmentWithId = (model: Model, id: CompartmentId): Compartment | null => {
    if (!hasCompartmentWithId(model, id)) return null;
    return model.compartments.get(id)!;
}

export const getTransitionWithId = (model: Model, id: TransitionId): Transition | null => {
    if (!hasTransitionWithId(model, id)) return null;
    return model.transitions.get(id)!;
}

export const addCompartment = (model: Model, compartment: Compartment): Model => {
    // the added compartment cannot have existing transitions
    if (hasCompartmentWithId(model, compartment.id) 
        || compartment.inTransitions.length > 0
        || compartment.outTransitions.length > 0) return model;

    return {
        ...model,
        compartments: new Map([...model.compartments, [compartment.id, compartment]])
    };
}

export const addTransition = (model: Model, transition: Transition): Model => {
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

    for (const existingTransitionId of start.outTransitions) {
        const currTransition = getTransitionWithId(model, existingTransitionId)!;
        if (currTransition.end === endId) return model;
    }

    // tests passed; can connect transition

    const newCompartments = new Map(model.compartments);

    newCompartments.set(startId, CompartmentLib.addOutTransition(start, transition.id));
    newCompartments.set(endId, CompartmentLib.addInTransition(end, transition.id));

    const newTransitions = new Map(model.transitions);
    newTransitions.set(transition.id, transition);

    return {
        ...model,
        compartments: newCompartments,
        transitions: newTransitions
    };

}

export const removeTransition = (model: Model, id: TransitionId): Model => {
    const transition = getTransitionWithId(model, id);
    if (!transition) return model;

    const startId = transition.start;
    const endId = transition.end;
    const start = getCompartmentWithId(model, startId)!;
    const end = getCompartmentWithId(model, endId)!;

    const newTransitions = new Map(model.transitions);
    newTransitions.delete(id);

    const newCompartments = new Map(model.compartments);

    newCompartments.set(startId, CompartmentLib.removeOutTransition(start, id));
    newCompartments.set(endId, CompartmentLib.removeInTransition(end, id));

    return {
        ...model,
        compartments: newCompartments,
        transitions: newTransitions
    };
}

export const removeCompartment = (model: Model, id: CompartmentId): Model => {
    const compartment = getCompartmentWithId(model, id);
    if (!compartment) return model;

    const transitionIdsToRemove = [ ...compartment.inTransitions, ...compartment.outTransitions ];
    for (const idToRemove of transitionIdsToRemove) {
        model = removeTransition(model, idToRemove);
    }

    const newCompartments = new Map(model.compartments);
    newCompartments.delete(id);

    const newModel: Model = {
        ...model,
        compartments: newCompartments
    };

    return newModel;
}

export const updateCompartment = (model: Model, id: CompartmentId, updates: Partial<Compartment>): Model => {
    const prevCompartment = getCompartmentWithId(model, id);
    if (!prevCompartment) return model;

    const newCompartment = { ...prevCompartment, ...updates };

    const newCompartments = new Map(model.compartments);
    newCompartments.set(prevCompartment.id, newCompartment);

    return {
        ...model,
        compartments: newCompartments
    };
}

export const convertToDbModel = (model: Model): DbModel => {
    const newCompartments: DbModel["compartments"] = [];
    const newTransitions: DbModel["transitions"] = [];

    model.compartments.forEach((compartment) => {
        newCompartments.push(CompartmentLib.convertToDbCompartment(compartment));
    });

    model.transitions.forEach((transition) => {
        newTransitions.push(TransitionLib.convertToDbTransition(transition));
    });

    return {
        ...model,
        compartments: newCompartments,
        transitions: newTransitions
    };
}

export const setName = (model: Model, name: string): Model => {
    return {
        ...model,
        modelName: name
    };
}

export const convertFromDbModel = (dbModel: DbModel): Model => {
    return {
        ...dbModel,
        compartments: new Map(
            dbModel.compartments.map(
                compartment => [compartment.id, CompartmentLib.convertFromDbCompartment(compartment)]
            )
        ),
        transitions: new Map(
            dbModel.transitions.map(
                transition => [transition.id, TransitionLib.convertFromDbTransition(transition)]
            )
        ),
    }
}

export const print = (model: Model): void => {
    let message = `\nPrinting model "${model.modelName}" (ID = ${model.id}):\n\nCOMPARTMENTS\n\n`;

    if (model.compartments.size == 0) {
        message += "(none)\n\n";
    }

    for (const compartment of model.compartments.values()) {
        message += `"${compartment.name}" (ID = ${compartment.id}) at (${Math.round(compartment.x)}, ${Math.round(compartment.y)}).`;

        const hasInTransitions = (compartment.inTransitions.length > 0);
        const hasOutTransitions = (compartment.outTransitions.length > 0);

        if (!hasInTransitions && !hasOutTransitions) {
            message += `\n- (no transitions)`;
        }

        for (const outTransitionId of compartment.outTransitions) {
            const outTransition = getTransitionWithId(model, outTransitionId)!;
            const dest = getCompartmentWithId(model, outTransition.end)!;
            message += `\n- Can go to "${dest.name}" (compartment ID = ${dest.id}; transition ID = ${outTransitionId})`;
        }

        for (const inTransitionId of compartment.inTransitions) {
            const inTransition = getTransitionWithId(model, inTransitionId)!;
            const start = getCompartmentWithId(model, inTransition.start)!;
            message += `\n- Can come from "${start.name}" (compartment ID = ${start.id}; transition ID = ${inTransitionId})`;
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