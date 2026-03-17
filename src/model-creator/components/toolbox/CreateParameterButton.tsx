import { useModelCreator, type ModelCreatorContextData } from "../../ModelCreatorContext";
import React from 'react';

const contextDataSelector = (data: ModelCreatorContextData) => ({
    modelParamsSize:  data.model?.parameters.size,
    createModelParam: data.createModelParameter,
});

export default function CreateParameterButton() {
    const { modelParamsSize, createModelParam } = useModelCreator(contextDataSelector);

    const handleCreateModelParam = React.useCallback(() => {
        if (modelParamsSize === undefined) return;
        createModelParam("parameter_" + (modelParamsSize + 1));
    }, [modelParamsSize, createModelParam]);


    return (
        <div className="cursor-pointer border border-white rounded-sm px-2 py-1"
                onClick={handleCreateModelParam}>
            Create parameter
        </div>
    );
}