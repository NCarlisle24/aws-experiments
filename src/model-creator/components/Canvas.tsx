import Compartment, { type CompartmentElement } from "./compartment/Compartment.tsx";
import Transition from "./transition/Transition.tsx";
import TransitionCreator from './transition/TransitionCreator.tsx';
import { useModelCreator, type ModelCreatorContextData } from "../ModelCreatorContext.ts";
import { Mode } from "../enums/Mode.ts";
import { ModelComponentLib } from '../system';


import React from 'react';
import { Xwrapper } from "react-xarrows";
import SaveButton from './SaveButton.tsx';

const contextDataSelector = (data: ModelCreatorContextData) => ({
    mode:                           data.mode,
    compartmentIds:                 [...data.model!.compartments.keys()],
    transitionIds:                  [...data.model!.transitions.keys()],
    transitionCreatorStart:         data.transitionCreatorStart,
    transitionCreatorEnd:           data.transitionCreatorEnd,
    deleteCompartment:              data.deleteCompartment,
});

const Canvas = React.forwardRef<CompartmentElement>((_, ref) => {
    // states + refs

    const { 
        mode,
        compartmentIds,
        transitionIds,
        deleteCompartment,
        transitionCreatorStart,
        transitionCreatorEnd
    } = useModelCreator(contextDataSelector);

    const compartmentRefs = React.useRef<Map<ModelComponentLib.ModelComponentId, CompartmentElement>>(new Map());

    // function helpers

    const getCompartmentRef = (key: ModelComponentLib.ModelComponentId) => ({
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
                {compartmentIds.map((id) => 
                    <Compartment 
                        key={id} 
                        compartmentId={id}
                        deleteSelf={() => deleteCompartment(id)}
                        ref={(el: CompartmentElement) => {
                            if (el) {
                                compartmentRefs.current.set(id, el);
                            } else {
                                compartmentRefs.current.delete(id);
                            }
                        }}
                    />
                )}
                {transitionIds.map((id) => 
                    <Transition 
                        key={id} 
                        transitionId={id}
                        getCompartmentRef={getCompartmentRef}
                    />
                )}

                {transitionCreatorStart !== null && <TransitionCreator start={getCompartmentRef(transitionCreatorStart)} 
                    end={transitionCreatorEnd !== null ? getCompartmentRef(transitionCreatorEnd) : undefined}/>}
            </Xwrapper>

            <div className="absolute left-5 top-5">
                <SaveButton />
            </div>
        </div>
    );
});

export default Canvas;