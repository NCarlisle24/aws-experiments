import React from 'react';
import { useParams } from 'react-router-dom';

import Toolbox from './components/toolbox/Toolbox.tsx';
import Canvas from './components/Canvas.tsx';
import { type CompartmentProps } from './components/compartment/Compartment.tsx';
import { SimModelLib, CompartmentLib, TransitionLib } from './system';
import { SimContext, type SimContextData } from './SimContext';
import { Mode } from './enums/Mode.ts';
import restApi from '../rest-api/restApi.ts';
import { useAuth } from '../auth/index.ts';

import './sim.css';
import LargeLoader from '../components/LargeLoader.tsx';

export default function MainController() {
    const [model, setModel] = React.useState<SimModelLib.SimModel | null>(null)
    const [mode, setMode] = React.useState<Mode>(Mode.DEFAULT);
    const canvasRef: SimContextData["canvasRef"] = React.useRef(null);
    const compartmentIdRef = React.useRef<CompartmentLib.CompartmentId>(0);
    const transitionIdRef = React.useRef<CompartmentLib.CompartmentId>(0);

    const [transitionCreatorStart, setTransitionCreatorStart] = React.useState<CompartmentLib.CompartmentId | null>(null);
    const [transitionCreatorEnd, setTransitionCreatorEnd] = React.useState<CompartmentLib.CompartmentId | null>(null);

    const authContextData = useAuth();
    const { projectId } = useParams();
    const safeProjectId = projectId ?? "";

    const createCompartmentDeleteHandler = (id: CompartmentLib.CompartmentId): CompartmentProps["deleteSelf"] => {
        return () => {
            setModel(prev => {
                if (prev === null) return null;
                return SimModelLib.removeCompartment(prev, id);
            });
        }
    }


    const createCompartment = (name: string, x: number, y: number) => {
        const newCompartment = CompartmentLib.create(name, x, y, compartmentIdRef.current);
        compartmentIdRef.current++;

        setModel(prev => {
            if (prev === null) return null;
            return SimModelLib.addCompartment(prev, newCompartment)
        });
    }

    const createTransition = (startId: CompartmentLib.CompartmentId, endId: CompartmentLib.CompartmentId) => {
        const newTransition = TransitionLib.create(startId, endId, transitionIdRef.current);
        transitionIdRef.current++;

        setModel(prev => {
            if (prev === null) return null;
            const newModel = SimModelLib.addTransition(prev, newTransition);
            return newModel;
        })
    }

    React.useEffect(() => {
        (async () => {
            const project = await restApi.getUserProject(authContextData, safeProjectId);

            if (project === null) {
                console.log("project not found");
                return;
            }

            setModel(project.model);
        })();
    }, []);

    if (model === null) {
        return <LargeLoader message="Loading project..."/>;
    }

    return (
        <main className="grid grid-cols-2 h-full w-full" style={{ gridTemplateColumns: "1fr 3fr" }}>
            <SimContext.Provider value={{model, mode, canvasRef, setModel, setMode, createCompartmentDeleteHandler, 
                                        createCompartment, createTransition, transitionCreatorStart, 
                                        projectId: safeProjectId, transitionCreatorEnd, setTransitionCreatorEnd, 
                                        setTransitionCreatorStart}}>
                <div className="bg-tertiary col-start-1 col-span-1">
                    <Toolbox></Toolbox>
                </div>
                <div className="col-start-2 col-span-1 bg-sim-canvas">
                    <Canvas ref={canvasRef}></Canvas>
                </div>
            </SimContext.Provider>
        </main>
    )
}