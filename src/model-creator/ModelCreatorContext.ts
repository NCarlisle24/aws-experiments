import React from 'react';

import { ModelLib, CompartmentLib } from './system/index.ts';
import { Mode } from './enums/Mode.ts';
import type { Focus, Focusable } from './system/Focus.ts';

export interface ModelCreatorContextData {
    readonly model: ModelLib.Model;
    readonly canvasRef: React.RefObject<HTMLDivElement | null>;
    readonly mode: Mode;
    readonly setMode: (mode: Mode) => any;
    readonly focus: Focus;
    readonly addToFocus: (obj: Focusable) => any;
    readonly removeFromFocus: (callbackFn: ((obj: Focusable) => boolean)) => any;
    readonly resetFocus: () => any;
    readonly setModelName: (name: string) => any;
    readonly createCompartmentDeleteHandler: (id: CompartmentLib.CompartmentId) => (() => any);
    readonly createCompartment: (name: string, x: number, y: number) => any;
    readonly updateCompartment: (compartmentId: CompartmentLib.CompartmentId, updates: Partial<CompartmentLib.Compartment>) => any,
    readonly createTransition: (startId: CompartmentLib.CompartmentId, endId: CompartmentLib.CompartmentId) => any;
    readonly transitionCreatorStart: CompartmentLib.CompartmentId | null,
    readonly transitionCreatorEnd: CompartmentLib.CompartmentId | null,
    readonly setTransitionCreatorStart: (compartment: CompartmentLib.CompartmentId | null) => any,
    readonly setTransitionCreatorEnd: (compartment: CompartmentLib.CompartmentId | null) => any,
}

export const ModelCreatorContext = React.createContext<ModelCreatorContextData | null>(null);

export const useModelCreator = () => {
    const data = React.useContext(ModelCreatorContext);

    if (!data) {
        throw new Error("useModelCreator must be used within a ModelCreatorContext provider.");
    }

    // if (!data.canvasRef || !data.canvasRef.current) {
    //     throw new Error("Canvas ref not specified.");
    // }

    return data;
};