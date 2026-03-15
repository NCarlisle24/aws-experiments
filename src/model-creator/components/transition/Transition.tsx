import Xarrow from "react-xarrows";
import React from 'react';

import type { ModelComponentLib } from "../../system";
import { useModelCreator, type ModelCreatorContextData } from "../../ModelCreatorContext";
import { type CompartmentElement } from "../compartment/Compartment";

export interface TransitionProps {
    transitionId: ModelComponentLib.ModelComponentId,
    getCompartmentRef: (id: ModelComponentLib.ModelComponentId) => React.RefObject<CompartmentElement | null>
};

export default function Transition({ transitionId, getCompartmentRef }: TransitionProps) {
    const contextDataSelector = React.useCallback((data: ModelCreatorContextData) => ({
        transition: data.model!.transitions.get(transitionId)!
    }), [transitionId]);

    const { transition } = useModelCreator(contextDataSelector);

    return (
        <Xarrow start={getCompartmentRef(transition.start)} end={getCompartmentRef(transition.end)} path="straight"/>
    );
}