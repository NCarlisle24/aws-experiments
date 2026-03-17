import CompartmentTool from "./CompartmentTool";
import ModeSelectorBar from "./ModeSelectorBar";
import ModelParameter from "./ModelParameter";

import { useModelCreator, type ModelCreatorContextData } from "../../ModelCreatorContext";
import { Mode } from "../../enums/Mode";

import React from 'react';
import CreateParameterButton from "./CreateParameterButton";

const contextDataSelector = (data: ModelCreatorContextData) => ({
    mode: data.mode,
    modelParams: data.model?.parameters,
});

export default function Toolbox() {
    const { mode, modelParams } = useModelCreator(contextDataSelector);

    let cursor = "default";
    if (Mode.isEqual(mode, Mode.CREATE_COMPARTMENT) || Mode.isEqual(mode, Mode.MOVE_COMPARTMENT)) {
        cursor = "move";
    } else if (Mode.isEqual(mode, Mode.CREATE_TRANSITION)) {
        cursor = "crosshair";
    }

    const style: React.CSSProperties = {
        cursor,
        gridTemplateRows: "50% 50%",
    };

    return (
        <div className="grid grid-rows-2 min-h-full w-full z-[-1024] py-5 px-6" style={style}>
            <div className="flex flex-col">
                <span className="text-xl font-bold">Tools</span>
                <div className="grow flex flex-col py-4 gap-4">
                    <ModeSelectorBar />
                    <div className="grow">
                        <CompartmentTool name="Compartment"/>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-start gap-2 w-full">
                <span className="text-xl font-bold">Parameters</span>
                {!modelParams ? 
                    <>Loading...</>
                : 
                    <>
                        <CreateParameterButton />
                        <div className="overflow-y-scroll w-full">
                            {Array.from(modelParams).map(([_, param]) => <ModelParameter paramName={param.name} key={param.name} />)}
                        </div>
                    </>
                }
            </div>
        </div>
    );
}