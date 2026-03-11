import { SimModelLib, CompartmentLib } from '../system/index.ts';

import Compartment, { type CompartmentElement } from "./compartment/Compartment.tsx";
import Transition from "./transition/Transition.tsx";
import TransitionCreator from './transition/TransitionCreator.tsx';
import { useSimCreator } from "../SimContext.ts";
import { Mode } from "../enums/Mode.ts";

import React from 'react';
import { Xwrapper } from "react-xarrows";
import SaveButton from './SaveButton.tsx';

const Canvas = React.forwardRef<CompartmentElement>((_, ref) => {
    // states + refs

    const { mode, model, createCompartmentDeleteHandler, transitionCreatorStart, transitionCreatorEnd } = useSimCreator();
    const compartmentRefs = React.useRef<Map<CompartmentLib.CompartmentId, CompartmentElement>>(new Map());

    // function helpers

    const getCompartmentRef = (key: CompartmentLib.CompartmentId) => ({
        get current() {
            return compartmentRefs.current.get(key) ?? null;
        }
    } as React.RefObject<CompartmentElement | null>);

    // create canvas
    // Xwrapper is used for Xarrows (required for movement updates)

    let cursor = "default";
    if (Mode.isEqual(mode, Mode.CREATE_COMPARTMENT) || Mode.isEqual(mode, Mode.MOVE_COMPARTMENT)) {
        cursor = "move";
    } else if (Mode.isEqual(mode, Mode.CREATE_TRANSITION)) {
        cursor = "crosshair";
    }

    const style: React.CSSProperties = {
        cursor
    };

    return (
        <div className="relative top-0 left-0 w-full h-full" style={style} ref={ref}>
            <Xwrapper>
                {Array.from(model.compartments.entries()).map(([id, compartment]) => 
                    <Compartment 
                        key={id} 
                        compartment={compartment}
                        deleteSelf={createCompartmentDeleteHandler(id)}
                        ref={(el: CompartmentElement) => {
                            if (el) {
                                compartmentRefs.current.set(id, el);
                            } else {
                                compartmentRefs.current.delete(id);
                            }
                        }}
                    />
                )}
                {Array.from(model.transitions.entries()).map(([id, transition]) => 
                    <Transition 
                        key={id} 
                        start={getCompartmentRef(transition.start)}
                        end={getCompartmentRef(transition.end)}
                    />
                )}

                {transitionCreatorStart !== null && <TransitionCreator start={getCompartmentRef(transitionCreatorStart)} 
                    end={transitionCreatorEnd !== null ? getCompartmentRef(transitionCreatorEnd) : undefined}/>}
            </Xwrapper>

            <a className="absolute right-10 bottom-10 bg-quaternary p-2 rounded-sm cursor-pointer text-center" 
                onClick={() => SimModelLib.print(model)}>
                    Debug button<br />
                    (mode='{mode}')
            </a>

            <div className="absolute left-5 top-5">
                <SaveButton />
            </div>
        </div>
    );
});

export default Canvas;