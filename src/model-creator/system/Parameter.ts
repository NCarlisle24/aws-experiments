import type { DbModelParameter } from "../../../amplify/data/tables";

export type ModelParameterType = string;
export type ModelParameterShape = string;

export interface ModelParameter {
    readonly name:    string
    readonly type:    ModelParameterType,
    readonly shape:   ModelParameterShape,
    readonly comment: string,
};

export const createParameter = (name: string): ModelParameter => {
    return {
        name,
        type: "float",
        shape: "TxN",
        comment: "",
    };
};

export const updateParameter = (parameter: ModelParameter, updates: Partial<ModelParameter>): ModelParameter => {
    return {
        ...parameter,
        ...updates
    };
};

export const convertToDbParameter = (parameter: ModelParameter): DbModelParameter => {
    return {
        ...parameter
    };
}

export const convertFromDbParameter = (dbParameter: DbModelParameter): ModelParameter => {
    return {
        ...dbParameter
    };
}