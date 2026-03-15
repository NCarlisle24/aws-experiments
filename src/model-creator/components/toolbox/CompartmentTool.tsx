import { useModelCreator, type ModelCreatorContextData } from "../../ModelCreatorContext";
import CompartmentTemplate, { type CompartmentTemplateProps } from '../compartment/CompartmentTemplate';
import { getMousePos } from "../compartment/CompartmentUtils";
import { Mode } from "../../enums/Mode";

import React from 'react';

interface CompartmentToolProps {
    name: string;
};

const contextDataSelector = (data: ModelCreatorContextData) => ({
    canvasRef:         data.canvasRef,
    createCompartment: data.createCompartment,
    mode:              data.mode,
    setMode:           data.setMode
});

export default function CompartmentTool({ name }: CompartmentToolProps) {
    const {
        canvasRef,
        createCompartment,
        mode,
        setMode
    } = useModelCreator(contextDataSelector);

    const compartmentCreatorRef = React.useRef<HTMLDivElement>(null);

    let cursor = "grab";
    if (Mode.isEqual(mode, Mode.MOVE_COMPARTMENT) || Mode.isEqual(mode, Mode.CREATE_COMPARTMENT)) {
        cursor = "move";
    }

    const draggableTemplateProps: CompartmentTemplateProps = {
        isDraggable: true,
        name,
        style: {
            position: "absolute",
            zIndex: 1,
            cursor
        },
        onPickup: () => {
            setMode(Mode.CREATE_COMPARTMENT);
        },
        onRelease: (e, _x, _y, setPos) => {
            setMode(Mode.SELECT);

            const canvasRect = canvasRef.current!.getBoundingClientRect();
            const mousePos = getMousePos(e);

            // if the mouse is in the canvas, create a new compartment

            if (mousePos.x >= canvasRect.left && mousePos.x <= canvasRect.right 
                && mousePos.y <= canvasRect.bottom && mousePos.y >= canvasRect.top)
            {
                const fixedPos = compartmentCreatorRef.current!.getBoundingClientRect();
                createCompartment(name, fixedPos.left - canvasRect.left, fixedPos.top - canvasRect.top);
            }

            setPos({ x: 0, y: 0 });
        }
    };

    const nonDraggableTemplateProps: CompartmentTemplateProps = {
        isDraggable: false,
        name,
        style: {
            position: "relative",
            cursor: "move",
        },
    };

    return (
        <div className="relative top-0 left-0">
            <CompartmentTemplate {...nonDraggableTemplateProps}></CompartmentTemplate>
            <CompartmentTemplate {...draggableTemplateProps} ref={compartmentCreatorRef}></CompartmentTemplate>
        </div>
    );
}