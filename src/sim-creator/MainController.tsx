import React from 'react';

import Toolbox from './components/toolbox/Toolbox.tsx';
import Canvas from './components/Canvas.tsx';
import { type CompartmentProps } from './components/compartment/Compartment.tsx';
import { SimModelLib, CompartmentLib, TransitionLib } from './system';
import { SimContext, type SimContextData } from './SimContext';
import { Mode } from './enums/Mode.ts';

import './sim.css';

export default function MainController() {
    const [model, setModel] = React.useState<SimModelLib.SimModel>(SimModelLib.create())
    const [mode, setMode] = React.useState<Mode>(Mode.DEFAULT);
    const canvasRef: SimContextData["canvasRef"] = React.useRef(null);
    const compartmentIdRef = React.useRef<CompartmentLib.CompartmentId>(0);
    const transitionIdRef = React.useRef<CompartmentLib.CompartmentId>(0);

    const [transitionCreatorStart, setTransitionCreatorStart] = React.useState<CompartmentLib.CompartmentId | null>(null);
    const [transitionCreatorEnd, setTransitionCreatorEnd] = React.useState<CompartmentLib.CompartmentId | null>(null);

    const createCompartmentDeleteHandler = (id: CompartmentLib.CompartmentId): CompartmentProps["deleteSelf"] => {
        return () => {
            setModel(prev => {
                return SimModelLib.removeCompartment(prev, id)
            });
        }
    }


    const createCompartment = (name: string, x: number, y: number) => {
        const newCompartment = CompartmentLib.create(name, x, y, compartmentIdRef.current);
        compartmentIdRef.current++;

        setModel(prev => SimModelLib.addCompartment(prev, newCompartment));
    }

    const createTransition = (startId: CompartmentLib.CompartmentId, endId: CompartmentLib.CompartmentId) => {
        const newTransition = TransitionLib.create(startId, endId, transitionIdRef.current);
        transitionIdRef.current++;

        setModel(prev => {
            const newModel = SimModelLib.addTransition(prev, newTransition);
            return newModel;
        })
    }

    return (
        <main className="flex h-full w-full">
            <SimContext.Provider value={{model, mode, canvasRef, setModel, setMode, createCompartmentDeleteHandler, 
                                         createCompartment, createTransition, transitionCreatorStart, 
                                         transitionCreatorEnd, setTransitionCreatorEnd, setTransitionCreatorStart}}>
                <div className="grow bg-tertiary">
                    <Toolbox></Toolbox>
                </div>
                <div className="grow-4 col-start-2 col-span-1 bg-sim-canvas">
                    <Canvas ref={canvasRef}></Canvas>
                </div>
            </SimContext.Provider>
        </main>
    )
}