import type { CompartmentId } from './Compartment.ts';
import type { Transition, TransitionId } from '../../../amplify/data/tables.ts';

export { type Transition, type TransitionId };

export const create = (start: CompartmentId, end: CompartmentId, id: TransitionId): Transition => ({
    id,
    start,
    end
});