import type { CompartmentId } from './Compartment.ts';
import type { DbTransition, TransitionId } from '../../../amplify/data/tables.ts';
import type { Focusable } from './Focus.ts';

export interface Transition extends DbTransition, Focusable { };

export type { TransitionId };

export const create = (start: CompartmentId, end: CompartmentId, id: TransitionId): Transition => ({
    id,
    start,
    end,
    weight: "",
    isInFocus: false
});

export const convertToDbTransition = (transition: Transition): DbTransition => {
    const { isInFocus: _, ...dbTransition} = transition;
    return dbTransition;
}

export const convertFromDbTransition = (dbTransition: DbTransition): Transition => {
    return {
        ...dbTransition,
        isInFocus: false
    };
}