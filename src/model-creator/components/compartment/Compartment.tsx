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
        isInFocus:                 data.focus.has(compartmentId),
        setMode:                   data.setMode,
        setTransitionCreatorStart: data.setTransitionCreatorStart,
        setTransitionCreatorEnd:   data.setTransitionCreatorEnd,
        updateComponent:           data.updateComponent,
        resetFocus:                data.resetFocus,
        addToFocus:                data.addToFocus,
        showContextMenu:           data.showContextMenu,
    }), [compartmentId]);

    const {
        canvasRef,
        mode,
        transitionCreatorStart,
        compartment,
        isInFocus,
        setMode,
        setTransitionCreatorStart,
        setTransitionCreatorEnd,
        updateComponent,
        resetFocus,
        addToFocus,
        showContextMenu,
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
        isInFocus,
        style: {
            position: "absolute",
            cursor
        },
        onPickup: () => {
            setMode(Mode.MOVE_COMPARTMENT);
        },
        onRelease: (e, x, y) => {
            setMode(Mode.SELECT);

            const currentMousePos = getMousePos(e);
            const canvasPos = canvasRef.current!.getBoundingClientRect();

            if (currentMousePos.x < canvasPos.left) {
                deleteSelf();
                return;
            }

            updateComponent(compartmentId, { x, y });
        },
        onDrag: () => {
            updateArrows();
        },
        onMouseDown: (e) => {
            resetFocus();
            addToFocus(compartmentId);

            // if it's a right click, show the context menu
            if (e.button == 2) showContextMenu(e.clientX, e.clientY);
        }
    } : {
        isDraggable: false,
        name: compartment.name,
        initialX: compartment.x,
        initialY: compartment.y,
        isInFocus,
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