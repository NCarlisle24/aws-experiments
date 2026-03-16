import { ModelComponentType, type ModelComponent, type ModelComponentId } from "./components/ModelComponent";
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

const MODEL_COMPONENT_TYPE_MAP = {
    [ModelComponentType.COMPARTMENT]: {
        add: (model: Model, compartment: Compartment): Model => {
            // the added compartment cannot have existing transitions
            if (model.components.has(compartment.id)
                || compartment.inTransitions.size > 0
                || compartment.outTransitions.size > 0
            ) {
                return model;
            }

            const newComponents = new Map(model.components);
            newComponents.set(compartment.id, compartment);

            const newModel: Model = {
                ...model,
                components: newComponents,
            };

            return updateSubmaps(newModel);
        },

        remove: (model: Model, compartmentId: ModelComponentId): Model => {
            const compartment = model.compartments.get(compartmentId);
            if (!compartment) return model;

            // remove transitions

            const transitionIdsToRemove = [ ...compartment.inTransitions, ...compartment.outTransitions ];
            for (const idToRemove of transitionIdsToRemove) {
                model = MODEL_COMPONENT_TYPE_MAP[ModelComponentType.TRANSITION].remove(model, idToRemove);
            }

            // remove compartment

            const newComponents = new Map(model.components);
            newComponents.delete(compartmentId);

            // return

            const newModel: Model = {
                ...model,
                components: newComponents,
            };

            return updateSubmaps(newModel);
        },

        update: (model: Model, compartmentId: ModelComponentId, updates: Partial<Compartment>): Model => {
            const prevCompartment = model.compartments.get(compartmentId);
            if (!prevCompartment) return model;

            // update compartment

            const newCompartment = { ...prevCompartment, ...updates };

            const newComponents = new Map(model.components);
            newComponents.set(compartmentId, newCompartment);

            // return

            const newModel: Model = {
                ...model,
                components: newComponents,
            };

            return updateSubmaps(newModel);
        }
    },

    [ModelComponentType.TRANSITION]: {
        add: (model: Model, transition: Transition): Model => {
            // rules: 
            // - transition must have a unique id
            // - the start and end must both be compartments
            // - both compartments need to exist in the model
            // - compartments must be unique
            // - an equivalent transition cannot already exist

            // unique ID

            if (model.components.has(transition.id)) return model;

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

            const newComponents = new Map(model.components);

            const newStartCompartment = CompartmentLib.addOutTransition(start, transition.id);
            const newEndCompartment = CompartmentLib.addInTransition(end, transition.id);

            newComponents.set(startId, newStartCompartment);
            newComponents.set(endId, newEndCompartment);
            newComponents.set(transition.id, transition);

            // return

            const newModel: Model = {
                ...model,
                components: newComponents,
            };

            return updateSubmaps(newModel);
        },

        remove: (model: Model, transitionId: ModelComponentId): Model => {
            const transition = model.transitions.get(transitionId);
            if (!transition) return model;

            const startId = transition.start;
            const endId = transition.end;
            const start = model.compartments.get(startId)!;
            const end = model.compartments.get(endId)!;

            // update components

            const newComponents = new Map(model.components);

            const newStartCompartment = CompartmentLib.removeOutTransition(start, transitionId);
            const newEndCompartment = CompartmentLib.removeInTransition(end, transitionId);

            newComponents.delete(transitionId);
            newComponents.set(startId, newStartCompartment);
            newComponents.set(endId, newEndCompartment);

            // return

            const newModel: Model = {
                ...model,
                components:   newComponents,
            };

            return updateSubmaps(newModel);
        },

        update: (model: Model, transitionId: ModelComponentId, updates: Partial<Transition>): Model => {
            const prevTransition = model.transitions.get(transitionId);
            if (!prevTransition) return model;

            // update transition

            const newTransition = { ...prevTransition, ...updates };

            const newComponents = new Map(model.components);
            newComponents.set(transitionId, newTransition);

            // return

            const newModel: Model = {
                ...model,
                components: newComponents,
            };

            return updateSubmaps(newModel);
        }
    },

    [ModelComponentType.UNKNOWN]: {
        add: (model: Model, component: ModelComponent): Model => {
            if (model.components.has(component.id)) return model;

            const newComponents = new Map(model.components);
            newComponents.set(component.id, component);

            const newModel: Model = {
                ...model,
                components: newComponents,
            };

            return updateSubmaps(newModel);
        },

        remove: (model: Model, componentId: ModelComponentId): Model => {
            if (!model.components.has(componentId)) return model;

            const newComponents = new Map(model.components);
            newComponents.delete(componentId);

            const newModel: Model = {
                ...model,
                components: newComponents,
            };

            return updateSubmaps(newModel);
        },

        update: <C = ModelComponent>(model: Model, componentId: ModelComponentId, updates: Partial<C>): Model => {
            const component = model.components.get(componentId);
            if (!component) return model;

            const newComponent: ModelComponent = {
                ...component,
                ...updates,
            };

            const newComponents = new Map(model.components);
            newComponents.set(componentId, newComponent);

            const newModel: Model = {
                ...model,
                components: newComponents
            };

            return updateSubmaps(newModel);
        },
    },
} as const;

const updateSubmaps = (model: Model): Model => {
    const newCompartments: Map<ModelComponentId, Compartment> = new Map();
    const newTransitions: Map<ModelComponentId, Transition> = new Map();

    model.components.forEach((component, componentId) => {
        if (component.type === ModelComponentType.COMPARTMENT) {
            newCompartments.set(componentId, component as Compartment);
        } else if (component.type === ModelComponentType.TRANSITION) {
            newTransitions.set(componentId, component as Transition);
        }
    });

    return {
        ...model,
        compartments: newCompartments,
        transitions: newTransitions,
    };
}

export const addComponent = (model: Model, component: ModelComponent): Model => {
    // typescript gives errors if I try to access the table, so we'll directly call the
    // functions for now

    // TODO: resolve open/closed violation here

    if (component.type === ModelComponentType.COMPARTMENT) {
        return MODEL_COMPONENT_TYPE_MAP[ModelComponentType.COMPARTMENT].add(model, component as Compartment);
    }

    if (component.type === ModelComponentType.TRANSITION) {
        return MODEL_COMPONENT_TYPE_MAP[ModelComponentType.TRANSITION].add(model, component as Transition);
    }

    return MODEL_COMPONENT_TYPE_MAP[ModelComponentType.UNKNOWN].add(model, component);
};

export const removeComponent = (model: Model, componentId: ModelComponentId): Model => {
    const component = model.components.get(componentId);
    if (!component) return model;

    const componentFunctions = MODEL_COMPONENT_TYPE_MAP[component.type];

    if (!componentFunctions) {
        return MODEL_COMPONENT_TYPE_MAP[ModelComponentType.UNKNOWN].remove(model, componentId);
    }

    return componentFunctions.remove(model, componentId);
};

export const updateComponent = (model: Model, componentId: ModelComponentId, updates: Partial<ModelComponent>): Model => {
    const component = model.components.get(componentId);
    if (!component) return model;

    const componentFunctions = MODEL_COMPONENT_TYPE_MAP[component.type];

    if (!componentFunctions) {
        return MODEL_COMPONENT_TYPE_MAP[ModelComponentType.UNKNOWN].update(model, componentId, updates);
    }

    return componentFunctions.update(model, componentId, updates);
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
        message += `- Weight = ${transition.weight}\n\n`;
    }

    message += "\n";
    
    console.log(message);
}