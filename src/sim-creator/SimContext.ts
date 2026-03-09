import React from 'react';

import { SimModelLib, CompartmentLib } from './system';
import { Mode } from './enums/Mode.ts';

export interface SimContextData {
    readonly model: SimModelLib.SimModel;
    readonly canvasRef: React.RefObject<HTMLDivElement | null>;
    readonly mode: Mode;
    readonly setModel: React.Dispatch<React.SetStateAction<SimModelLib.SimModel>>;
    readonly setMode: React.Dispatch<React.SetStateAction<Mode>>;
    readonly createCompartmentDeleteHandler: (id: CompartmentLib.CompartmentId) => (() => any);
    readonly createCompartment: (name: string, x: number, y: number) => any;
    readonly createTransition: (startId: CompartmentLib.CompartmentId, endId: CompartmentLib.CompartmentId) => any;
    readonly transitionCreatorStart: CompartmentLib.CompartmentId | null,
    readonly transitionCreatorEnd: CompartmentLib.CompartmentId | null,
    readonly setTransitionCreatorStart: React.Dispatch<React.SetStateAction<CompartmentLib.CompartmentId | null>>,
    readonly setTransitionCreatorEnd: React.Dispatch<React.SetStateAction<CompartmentLib.CompartmentId | null>>,
}

export const SimContext = React.createContext<SimContextData | null>(null);

export const useSimCreator = () => {
    const data = React.useContext(SimContext);

    if (!data) {
        throw new Error("useSimCreator must be used within a SimContext provider.");
    }

    // if (!data.canvasRef || !data.canvasRef.current) {
    //     throw new Error("Canvas ref not specified.");
    // }

    return data;
};