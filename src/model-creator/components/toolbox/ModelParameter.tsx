import { useModelCreator, type ModelCreatorContextData } from "../../ModelCreatorContext"

import React from 'react';

interface ModelParameterProps {
    paramName: string
};

export default function ModelParameter({ paramName }: ModelParameterProps) {
    const contextDataSelector = React.useCallback((data: ModelCreatorContextData) => ({
        parameter: data.model!.parameters.get(paramName)!
    }), [paramName]);

    const { parameter } = useModelCreator(contextDataSelector);

    return (
        <div className="flex">
            {parameter.name}
        </div>
    );
}