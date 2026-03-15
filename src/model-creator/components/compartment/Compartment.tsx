import React from 'react';
import { useXarrow } from 'react-xarrows';

import CompartmentTemplate, { type CompartmentTemplateProps } from './CompartmentTemplate';
import { useModelCreator, type ModelCreatorContextData } from '../../ModelCreatorContext';
import { getMousePos } from './CompartmentUtils';
import { ModelComponentLib } from '../../system';
import { Mode } from '../../enums/Mode';

export type CompartmentElement = HTMLDivElement;

export interface CompartmentProps {
    compartmentId: ModelComponentLib.ModelComponentId;
    deleteSelf: () => any;
}

const Compartment = React.forwardRef<CompartmentElement, CompartmentProps>(({ 
    compartmentId,
    deleteSelf, 
}: CompartmentProps, ref) => {
    const updateArrows = useXarrow();

    const contextDataSelector = React.useCallback((data: ModelCreatorContextData) => ({
        canvasRef:                 data.canvasRef,
        mode:                      data.mode,
        transitionCreatorStart:    data.transitionCreatorStart,
        compartment:               data.model!.compartments.get(compartmentId)!,
        setMode:                   data.setMode,
        setTransitionCreatorStart: data.setTransitionCreatorStart,
        setTransitionCreatorEnd:   data.setTransitionCreatorEnd,
        updateCompartment:         data.updateCompartment,
        resetFocus:                data.resetFocus,
        addToFocus:                data.addToFocus,
    }), [compartmentId]);

    const {
        canvasRef,
        mode,
        transitionCreatorStart,
        compartment,
        setMode,
        setTransitionCreatorStart,
        setTransitionCreatorEnd,
        updateCompartment,
        resetFocus,
        addToFocus
    } = useModelCreator(contextDataSelector);

    let cursor = "grab";
    if (Mode.isEqual(mode, Mode.MOVE_COMPARTMENT) || Mode.isEqual(mode, Mode.CREATE_COMPARTMENT)) {
        cursor = "move";
    } else if (Mode.isEqual(mode, Mode.CREATE_TRANSITION)) {
        cursor = "crosshair";
    }

    const templateProps: CompartmentTemplateProps = !Mode.isEqual(mode, Mode.CREATE_TRANSITION) ? {
        isDraggable: true,
        name: compartment.name,
        initialX: compartment.x,
        initialY: compartment.y,
        isInFocus: false,
        style: {
            position: "absolute",
            cursor
        },
        onPickup: () => {
            setMode(Mode.MOVE_COMPARTMENT);

            resetFocus();
            addToFocus(compartmentId);
        },
        onRelease: (e, x, y) => {
            setMode(Mode.SELECT);

            const currentMousePos = getMousePos(e);
            const canvasPos = canvasRef.current!.getBoundingClientRect();

            if (currentMousePos.x < canvasPos.left) {
                deleteSelf();
                return;
            }

            updateCompartment(compartmentId, { x, y });
        },
        onDrag: () => {
            updateArrows();
        },
    } : {
        isDraggable: false,
        name: compartment.name,
        initialX: compartment.x,
        initialY: compartment.y,
        isInFocus: false,
        style: {
            position: "absolute",
            cursor
        },
        onPickup: () => {
            setTransitionCreatorStart(compartmentId);
        },
        onMouseEnter: () => {
            if (transitionCreatorStart !== null && transitionCreatorStart !== compartmentId) {
                setTransitionCreatorEnd(compartmentId);
            }
        },
        onMouseLeave: () => {
            setTransitionCreatorEnd(null);
        },
    };

    return (
        <CompartmentTemplate {...templateProps} ref={ref}></CompartmentTemplate>
    );
});

export default Compartment;