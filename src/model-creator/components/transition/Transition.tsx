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
    const weightInputRef = React.useRef<HTMLInputElement>(null);

    const contextDataSelector = React.useCallback((data: ModelCreatorContextData) => ({
        transition:      data.model!.transitions.get(transitionId)!,
        isInFocus:       data.focus.has(transitionId),
        resetFocus:      data.resetFocus,
        addToFocus:      data.addToFocus,
        showContextMenu: data.showContextMenu,
        updateComponent: data.updateComponent,
    }), [transitionId]);

    const {
        transition,
        isInFocus,
        resetFocus,
        addToFocus,
        showContextMenu,
        updateComponent,
    } = useModelCreator(contextDataSelector);

    const style: React.CSSProperties = {
        cursor: "pointer",
        // shadow: isInFocus ? "0px 0px 10px rgba(0, 0, 100, 0.5)" : "",
        filter: isInFocus ? "drop-shadow(0px 0px 5px rgba(0, 0, 100, 0.5))" : "",
    };

    const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
        resetFocus();
        addToFocus(transitionId); 

        if (e.button == 2) {
            showContextMenu(e.clientX, e.clientY)
            weightInputRef.current?.blur();
        };
    }, [transitionId, resetFocus, addToFocus, showContextMenu]);

    const submitTransitionWeight = () => {
        if (weightInputRef.current === null) return;
        weightInputRef.current.blur();

        const currentValue = weightInputRef.current.value;

        if (currentValue.length == 0) {
            weightInputRef.current.value = "0";
            updateComponent(transitionId, { weight: "0" });
            return;
        }

        updateComponent(transitionId, { weight: currentValue });
    }

    return (
        <Xarrow start={getCompartmentRef(transition.start)} end={getCompartmentRef(transition.end)} path="straight"
                passProps={{ style, onMouseDown: handleMouseDown }}
                labels={
                    <input className="bg-white rounded-sm border border-black text-black text-center w-20" 
                        onMouseDown={handleMouseDown} 
                        defaultValue={transition.weight}
                        onBlur={submitTransitionWeight} 
                        onKeyDown={ (e) => { if (e.key === 'Enter') submitTransitionWeight() } } 
                        ref={weightInputRef}
                    >
                    </input>
                } />
    );
}