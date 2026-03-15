import { type ModelComponent, type ModelComponentId } from "./components/ModelComponent";
import type { Compartment } from "./components/Compartment";
import type { Transition } from "./components/Transition";
import type { DbModel, ModelId } from '../../../amplify/data/tables';
import * as CompartmentLib from "./components/Compartment";
import * as TransitionLib from "./components/Transition";

export { type ModelId };

export interface Model {
    readonly id:             ModelId,
    readonly userId:         string,
    readonly name:           string,
    readonly createdAt:      string,
    readonly lastModifiedAt: string,
    readonly components:     ReadonlyMap<ModelComponentId, ModelComponent>,
    readonly compartments:   ReadonlyMap<ModelComponentId, Compartment>,
    readonly transitions:    ReadonlyMap<ModelComponentId, Transition>,
};

export const addCompartment = (model: Model, compartment: Compartment): Model => {
    // the added compartment cannot have existing transitions
    if (model.components.has(compartment.id)
        || compartment.inTransitions.size > 0
        || compartment.outTransitions.size > 0
    ) {
        return model;
    }

    const newComponents = new Map(model.components);
    newComponents.set(compartment.id, compartment);

    const newCompartments = new Map(model.compartments);
    newCompartments.set(compartment.id, compartment);

    return {
        ...model,
        components: newComponents,
        compartments: newCompartments,
    };
}

export const addTransition = (model: Model, transition: Transition): Model => {
    // rules: 
    // - transition must have a unique id
    // - the start and end must both be compartments
    // - both compartments need to exist in the model
    // - compartments must be unique
    // - an equivalent transition cannot already exist

    // unique ID

    if (model.transitions.has(transition.id)) return model;

    // check start and end

    const startId = transition.start;
    const start = model.compartments.get(startId);

    const endId = transition.end;
    const end = model.compartments.get(endId);

    if (!start || !end || startId === endId) return model;

    // check for an equivalent transition

    for (const existingTransitionId of start.outTransitions) {
        const currTransition = model.transitions.get(existingTransitionId)!;
        if (currTransition.end === endId) return model;
    }

    // tests passed; can connect transition

    // compartments

    const newCompartments = new Map(model.compartments);

    const newStartCompartment = CompartmentLib.addOutTransition(start, transition.id);
    const newEndCompartment = CompartmentLib.addInTransition(end, transition.id);

    newCompartments.set(startId, newStartCompartment);
    newCompartments.set(endId, newEndCompartment);

    // transition

    const newTransitions = new Map(model.transitions);

    newTransitions.set(transition.id, transition);

    // components

    const newComponents = new Map(model.components);

    newComponents.set(startId, newStartCompartment);
    newComponents.set(endId, newEndCompartment);
    newComponents.set(transition.id, transition);

    // return

    return {
        ...model,
        components:   newComponents,
        compartments: newCompartments,
        transitions:  newTransitions
    };

}

export const removeTransition = (model: Model, id: ModelComponentId): Model => {
    const transition = model.transitions.get(id);
    if (!transition) return model;

    const startId = transition.start;
    const endId = transition.end;
    const start = model.compartments.get(startId)!;
    const end = model.compartments.get(endId)!;

    // transition

    const newTransitions = new Map(model.transitions);
    newTransitions.delete(id);

    // compartments

    const newCompartments = new Map(model.compartments);

    const newStartCompartment = CompartmentLib.removeOutTransition(start, id);
    const newEndCompartment = CompartmentLib.removeInTransition(end, id);

    newCompartments.set(startId, newStartCompartment);
    newCompartments.set(endId, newEndCompartment);

    // components

    const newComponents = new Map(model.components);

    newComponents.delete(id);
    newComponents.set(startId, newStartCompartment);
    newComponents.set(endId, newEndCompartment);

    // return

    return {
        ...model,
        components:   newComponents,
        compartments: newCompartments,
        transitions:  newTransitions,
    };
}

export const removeCompartment = (model: Model, id: ModelComponentId): Model => {
    const compartment = model.compartments.get(id);
    if (!compartment) return model;

    // remove transitions

    const transitionIdsToRemove = [ ...compartment.inTransitions, ...compartment.outTransitions ];
    for (const idToRemove of transitionIdsToRemove) {
        model = removeTransition(model, idToRemove);
    }

    // remove compartment

    const newCompartments = new Map(model.compartments);
    newCompartments.delete(id);

    const newComponents = new Map(model.components);
    newComponents.delete(id);

    // return

    const newModel: Model = {
        ...model,
        components:   newComponents,
        compartments: newCompartments,
    };

    return newModel;
}

export const updateCompartment = (model: Model, id: ModelComponentId, updates: Partial<Compartment>): Model => {
    const prevCompartment = model.compartments.get(id);
    if (!prevCompartment) return model;

    // update compartment

    const newCompartment = { ...prevCompartment, ...updates };

    const newCompartments = new Map(model.compartments);
    newCompartments.set(id, newCompartment);

    // update components

    const newComponents = new Map(model.components);
    newComponents.set(id, newCompartment);

    // return

    return {
        ...model,
        components:   newComponents,
        compartments: newCompartments,
    };
}

export const setName = (model: Model, name: string): Model => {
    return { ...model, name };
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

    const convertedModel: DbModel = {
        id:             model.id,
        user_id:        model.userId,
        modelName:      model.name,
        createdAt:      model.createdAt,
        lastModifiedAt: model.lastModifiedAt,
        compartments:   newCompartments,
        transitions:    newTransitions,
    };

    return convertedModel;
}

export const convertFromDbModel = (dbModel: DbModel): Model => {
    const compartments: Model["compartments"] = new Map(
        dbModel.compartments.map(
            compartment => [compartment.id, CompartmentLib.convertFromDbCompartment(compartment)]
        )
    );

    const transitions: Model["transitions"] = new Map(
        dbModel.transitions.map(
            transition => [transition.id, TransitionLib.convertFromDbTransition(transition)]
        )
    );

    const components: Model["components"] = new Map(
        [...compartments as Model["components"], ...transitions as Model["components"]]
    );

    const model: Model = {
        id:             dbModel.id,
        userId:         dbModel.user_id,
        name:           dbModel.modelName,
        createdAt:      dbModel.createdAt,
        lastModifiedAt: dbModel.lastModifiedAt,
        components,
        compartments,
        transitions,
    };

    return model;
}

export const print = (model: Model): void => {
    let message = `\nPrinting model "${model.name}" (ID = ${model.id}):\n\nCOMPARTMENTS\n\n`;

    if (model.compartments.size == 0) {
        message += "(none)\n\n";
    }

    for (const compartment of model.compartments.values()) {
        message += `"${compartment.name}" (ID = ${compartment.id}) at (${Math.round(compartment.x)}, ${Math.round(compartment.y)}).`;

        const hasInTransitions = (compartment.inTransitions.size > 0);
        const hasOutTransitions = (compartment.outTransitions.size > 0);

        if (!hasInTransitions && !hasOutTransitions) {
            message += `\n- (no transitions)`;
        }

        for (const outTransitionId of compartment.outTransitions) {
            const outTransition = model.transitions.get(outTransitionId)!;
            const dest = model.compartments.get(outTransition.end)!;

            message += `\n- Can go to "${dest.name}" (compartment ID = ${dest.id}; transition ID = ${outTransitionId})`;
        }

        for (const inTransitionId of compartment.inTransitions) {
            const inTransition = model.transitions.get(inTransitionId)!;
            const start = model.compartments.get(inTransition.start)!;

            message += `\n- Can come from "${start.name}" (compartment ID = ${start.id}; transition ID = ${inTransitionId})`;
        }

        message += "\n\n";
    }

    message += "\nTRANSITIONS\n\n";

    if (model.transitions.size == 0) {
        message += "(none)\n";
    }

    for (const transition of model.transitions.values()) {
        const start = model.compartments.get(transition.start)!;
        const end = model.compartments.get(transition.end)!;

        message += `ID ${transition.id} connects "${start.name}" (ID = ${start.id}) to "${end.name}" (ID = ${end.id}).\n`;
    }

    message += "\n";
    
    console.log(message);
}