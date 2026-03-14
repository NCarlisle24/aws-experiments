import { DEFAULT_COMPARTMENT_STYLE, getMousePos } from './CompartmentUtils';

import React, { type CSSProperties } from 'react';

type Position = {x: number, y: number};

export interface CompartmentTemplateProps {
    isDraggable: boolean;
    name: string;
    initialX?: number;
    initialY?: number;
    style?: CSSProperties;
    isInFocus?: boolean;
    onPickup?: (e: MouseEvent) => any;
    onDrag?: (e: MouseEvent) => any;
    onRelease?: (e: MouseEvent, x: number, y: number, setPos: React.Dispatch<React.SetStateAction<Position>>) => any;
    onMouseUp?: (e: React.MouseEvent) => any;
    onMouseEnter?: (e: React.MouseEvent) => any;
    onMouseLeave?: (e: React.MouseEvent) => any;
}

// TODO: move delete self into a user-defined onRelease

const CompartmentTemplate = React.forwardRef<HTMLDivElement, CompartmentTemplateProps>((
    {
        isDraggable, 
        name, 
        initialX, 
        initialY, 
        style, 
        isInFocus,
        onPickup, 
        onDrag, 
        onRelease, 
        onMouseUp ,
        onMouseEnter,
        onMouseLeave
    }: CompartmentTemplateProps,
    ref
) => {
    const [pos, setPos] = React.useState<Position>({x: initialX ?? 0, y: initialY ?? 0});
    const posRef = React.useRef<Position>(pos);

    React.useEffect(() => {
        posRef.current = pos;
    }, [pos])

    // todo: memoize this click handler?
    const handleLeftMouseDown = (e: React.MouseEvent) => {
        if (onPickup) onPickup(e.nativeEvent);

        const initialCompartmentPos = { ...pos };
        const initialMousePos = getMousePos(e);

        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggable) {
                const currentMousePos = getMousePos(e);
                setPos({
                    x: initialCompartmentPos.x + (currentMousePos.x - initialMousePos.x),
                    y: initialCompartmentPos.y + (currentMousePos.y - initialMousePos.y)
                });
            }

            if (onDrag) onDrag(e);
        }

        const handleLeftMouseUp = (e: MouseEvent) => {
            window.removeEventListener('mouseup', handleLeftMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);

            if (onRelease) onRelease(e, posRef.current.x, posRef.current.y, setPos);
        }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleLeftMouseUp);
    }

    const shadowStyle: React.CSSProperties = isInFocus ? {
        boxShadow: "0px 0px 10px rgba(0, 0, 100, 0.5)",
    } : {};

    return (
        <div style={{ 
                ...DEFAULT_COMPARTMENT_STYLE, 
                left: pos.x, 
                top: pos.y, 
                ...shadowStyle,
                ...style 
            }} 
             onMouseDown={handleLeftMouseDown} ref={ref} onMouseUp={onMouseUp} onMouseEnter={onMouseEnter}
             onMouseLeave={onMouseLeave}>
            {name}
        </div>
    );
});

export default CompartmentTemplate;