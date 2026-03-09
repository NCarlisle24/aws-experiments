import type { CompartmentId } from './Compartment.ts';

export type TransitionId = number;

export interface Transition {
    readonly id:    TransitionId,
    readonly start: CompartmentId,
    readonly end:   CompartmentId
}

export const create = (start: CompartmentId, end: CompartmentId, id: TransitionId): Transition => ({
    id,
    start,
    end
});