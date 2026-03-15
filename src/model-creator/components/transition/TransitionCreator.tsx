import { type CompartmentElement } from "../compartment/Compartment";
import { useModelCreator, type ModelCreatorContextData } from "../../ModelCreatorContext";
import { Mode } from "../../enums/Mode";

import Xarrow, { useXarrow } from "react-xarrows";
import React from 'react';

export interface TempTransitionProps {
    start: React.RefObject<CompartmentElement | null>
    end?: React.RefObject<CompartmentElement | null>
};

const contextDataSelector = (data: ModelCreatorContextData) => ({
    mode:                      data.mode,
    canvasRef:                 data.canvasRef,
    transitionCreatorStart:    data.transitionCreatorStart,
    transitionCreatorEnd:      data.transitionCreatorEnd,
    setTransitionCreatorStart: data.setTransitionCreatorStart,
    setTransitionCreatorEnd:   data.setTransitionCreatorEnd,
    createTransition:          data.createTransition,
});

export default function TransitionCreator({ start, end }: TempTransitionProps) {
    const {
        mode,
        canvasRef,
        transitionCreatorStart,
        transitionCreatorEnd,
        setTransitionCreatorStart,
        setTransitionCreatorEnd,
        createTransition
    } = useModelCreator(contextDataSelector);

    const [mousePos, setMousePos] = React.useState<{x: number, y: number} | null>(null);
    const mouseTargetRef = React.useRef<HTMLDivElement>(null);
    const updateArrows = useXarrow();

    const handleMouseUp = React.useCallback(() => {
        if (!Mode.isEqual(mode, Mode.CREATE_TRANSITION)) return;

        if (transitionCreatorStart !== null && transitionCreatorEnd !== null) {
            createTransition(transitionCreatorStart, transitionCreatorEnd);
        }

        setTransitionCreatorStart(null);
        setTransitionCreatorEnd(null);
    }, [transitionCreatorStart, transitionCreatorEnd]);

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const canvasRect = canvasRef.current!.getBoundingClientRect();
            const newMousePos = { x: e.clientX - canvasRect.left, y: e.clientY - canvasRect.top };
            setMousePos(newMousePos);

            updateArrows();
        }

        window.addEventListener('mousemove', handleMouseMove);

        window.addEventListener('mouseup', handleMouseUp);

        return () => { 
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseUp]);

    if (mousePos !== null) {
        const mouseTargetStyle = {
            left: mousePos.x,
            top: mousePos.y,
        };

        return (
            <>
                <div className="absolute" ref={mouseTargetRef} style={mouseTargetStyle}></div>
                <Xarrow start={start} end={end ?? mouseTargetRef} path="straight"/>
            </>
        );
    } else {
        return (<></>);
    }
}