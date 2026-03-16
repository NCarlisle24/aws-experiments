import type { DbTransition } from '../../../../amplify/data/tables.ts';
import * as ModelComponentLib from './ModelComponent.ts';

type TransitionWeight = string;

export interface Transition extends ModelComponentLib.BaseModelComponent { 
    start: ModelComponentLib.ModelComponentId,
    end: ModelComponentLib.ModelComponentId,
    weight: TransitionWeight,
};

export const createTransition = (
    id: ModelComponentLib.ModelComponentId,
    start: ModelComponentLib.ModelComponentId,
    end: ModelComponentLib.ModelComponentId,
): Transition => {
    const newComponent = ModelComponentLib.createComponent(
        id,
        ModelComponentLib.ModelComponentType.TRANSITION,
    );

    const createdTransition: Transition = {
        ...newComponent,
        start,
        end,
        weight: "0",
    }

    return createdTransition;
};

export const convertToDbTransition = (transition: Transition): DbTransition => {
    const dbTransition: DbTransition = {
        id: transition.id,
        start: transition.start,
        end: transition.end,
        weight: transition.weight,
    };

    return dbTransition;
}

export const convertFromDbTransition = (dbTransition: DbTransition): Transition => {
    const newComponent = ModelComponentLib.createComponent(
        dbTransition.id,
        ModelComponentLib.ModelComponentType.TRANSITION,
    );

    const newTransition: Transition = {
        ...newComponent,
        start: dbTransition.start,
        end: dbTransition.end,
        weight: dbTransition.weight,
    };

    return newTransition;
}