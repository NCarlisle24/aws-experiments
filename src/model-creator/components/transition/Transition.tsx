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
        transition:      data.model!.transitions.get(transitionId)!,
        isInFocus:       data.focus.has(transitionId),
        resetFocus:      data.resetFocus,
        addToFocus:      data.addToFocus,
        showContextMenu: data.showContextMenu,
    }), [transitionId]);

    const {
        transition,
        isInFocus,
        resetFocus,
        addToFocus,
        showContextMenu
    } = useModelCreator(contextDataSelector);

    const style: React.CSSProperties = {
        cursor: "pointer",
        // shadow: isInFocus ? "0px 0px 10px rgba(0, 0, 100, 0.5)" : "",
        filter: isInFocus ? "drop-shadow(0px 0px 5px rgba(0, 0, 100, 0.5))" : "",
    };

    const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
        resetFocus();
        addToFocus(transitionId); 
        if (e.button == 2) showContextMenu(e.clientX, e.clientY);
    }, [transitionId, resetFocus, addToFocus, showContextMenu]);

    return (
        <Xarrow start={getCompartmentRef(transition.start)} end={getCompartmentRef(transition.end)} path="straight"
                passProps={{ style, onMouseDown: handleMouseDown }}/>
    );
}