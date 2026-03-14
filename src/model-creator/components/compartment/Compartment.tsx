import React from 'react';
import { useXarrow } from 'react-xarrows';

import CompartmentTemplate, { type CompartmentTemplateProps } from './CompartmentTemplate';
import { useModelCreator } from '../../ModelCreatorContext';
import { getMousePos } from './CompartmentUtils';
import { CompartmentLib } from '../../system';
import { Mode } from '../../enums/Mode';

export type CompartmentElement = HTMLDivElement;

export interface CompartmentProps {
    compartment: CompartmentLib.Compartment;
    deleteSelf: () => any;
}

const Compartment = React.forwardRef<CompartmentElement, CompartmentProps>(({ 
    compartment, 
    deleteSelf, 
}: CompartmentProps, ref) => {
    const updateArrows = useXarrow();
    const { canvasRef, mode, setMode, transitionCreatorStart, setTransitionCreatorStart, 
            setTransitionCreatorEnd, updateCompartment, resetFocus, addToFocus } = useModelCreator();

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
        isInFocus: compartment.isInFocus,
        style: {
            position: "absolute",
            cursor
        },
        onPickup: () => {
            setMode(Mode.MOVE_COMPARTMENT);

            resetFocus();
            addToFocus(compartment);
        },
        onRelease: (e, x, y) => {
            setMode(Mode.SELECT);

            const currentMousePos = getMousePos(e);
            const canvasPos = canvasRef.current!.getBoundingClientRect();

            if (currentMousePos.x < canvasPos.left) {
                deleteSelf();
                return;
            }

            updateCompartment(compartment.id, { x, y });
        },
        onDrag: () => {
            updateArrows();
        },
    } : {
        isDraggable: false,
        name: compartment.name,
        initialX: compartment.x,
        initialY: compartment.y,
        isInFocus: compartment.isInFocus,
        style: {
            position: "absolute",
            cursor
        },
        onPickup: () => {
            setTransitionCreatorStart(compartment.id);
        },
        onMouseEnter: () => {
            if (transitionCreatorStart !== null && transitionCreatorStart !== compartment.id) {
                setTransitionCreatorEnd(compartment.id);
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