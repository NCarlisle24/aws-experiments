import { ModelLib } from "../model-creator";
import { ROUTES } from "../router";
import DeleteModelButton from "./DeleteModelButton";

import React from 'react';

interface ModelEntryProps {
    model: ModelLib.Model,
    afterDelete: () => any
};

export default function ModelEntry({ model, afterDelete }: ModelEntryProps) {
    const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

    const cursor = isDeleting ? "wait" : "pointer";

    return (
        <div className="relative top-0 left-0">
            <a className="flex justify-start w-full min-h-30 hover:bg-light-secondary rounded-lg p-4"
               style={{ cursor }}
               href={isDeleting ? undefined : ROUTES.MODEL_CREATOR + "/" + model.id}>
                <div className="flex flex-col justify-start">
                    <div className="text-xl font-bold">{isDeleting ? "Deleting: " + model.name : model.name}</div>
                    <div className="text-subtitle-on-secondary">{model.id}</div>
                    <div className="text-subtitle-on-secondary">Last modified: {model.lastModifiedAt}</div>
                    <div className="text-subtitle-on-secondary">
                        {model.compartments.size} compartments, {model.transitions.size} transitions
                    </div>
                </div>
            </a>
            <div className="absolute flex flex-col justify-center top-4 right-4">
                <DeleteModelButton model={model} onDelete={() => setIsDeleting(true)} 
                                   afterDelete={ () => { setIsDeleting(false); afterDelete(); } }/>
            </div>
        </div>
    );
}