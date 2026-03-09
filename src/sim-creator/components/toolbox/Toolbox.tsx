import CompartmentTool from "./CompartmentTool";
import { useSimCreator } from "../../SimContext";
import { Mode } from "../../enums/Mode";

import React from 'react';
import ModeSelectorBar from "./ModeSelectorBar";

export default function Toolbox() {
    const { mode } = useSimCreator();

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
        <div className="flex flex-col justify-around items-center min-h-full w-full z-[-1024] py-5" style={style}>
            <div className="grow flex flex-col justify-around items-center">
                <CompartmentTool name="Compartment"/>
            </div>
            
            <ModeSelectorBar />
        </div>
    );
}