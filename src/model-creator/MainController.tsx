import React from 'react';
import { useParams } from 'react-router-dom';

import Toolbox from './components/toolbox/Toolbox.tsx';
import Canvas from './components/Canvas.tsx';
import ModelCreatorNavbar from './components/Navbar.tsx';
import { type CompartmentProps } from './components/compartment/Compartment.tsx';
import { ModelLib, CompartmentLib, TransitionLib, FocusLib } from './system/index.ts';
import { createModelCreatorDataStore, ModelCreatorContext, type ModelCreatorContextData } from './ModelCreatorContext.ts';
import { Mode } from './enums/Mode.ts';
import restApi from '../rest-api/restApi.ts';
import { useAuth } from '../auth/index.ts';

import './model-creator.css';
import LargeLoader from '../components/LargeLoader.tsx';

export default function MainController() {
    const canvasRef: ModelCreatorContextData["canvasRef"] = React.useRef(null);
    const compartmentIdRef = React.useRef<CompartmentLib.CompartmentId>(0);
    const transitionIdRef = React.useRef<CompartmentLib.CompartmentId>(0);

    const authContextData = useAuth();
    const { modelId } = useParams();
    const safeModelId = modelId ?? "";

    // initialize the model

    const modelCreatorDataStore = React.useMemo(() => createModelCreatorDataStore({
        model: null,
        mode: Mode.DEFAULT,
        setMode: (mode: Mode) => {
            modelCreatorDataStore.setData(prevData => ({ ...prevData, mode }));
        },
        canvasRef,
        createCompartmentDeleteHandler: (id: CompartmentLib.CompartmentId): CompartmentProps["deleteSelf"] => {
            return () => {
                modelCreatorDataStore.setData(prevData => {
                    if (prevData.model === null) return prevData;
                    return {
                        ...prevData, 
                        model: ModelLib.removeCompartment(prevData.model, id),
                    };
                });
            }
        },
        createCompartment: (name: string, x: number, y: number) => {
            modelCreatorDataStore.setData(prevData => {
                if (prevData.model === null) return prevData;

                const newCompartment = CompartmentLib.create(name, x, y, compartmentIdRef.current++);

                return {
                    ...prevData,
                    model: ModelLib.addCompartment(prevData.model, newCompartment),
                };
            });
        },
        updateCompartment: (
            compartmentId: CompartmentLib.CompartmentId,
            updates: Partial<CompartmentLib.Compartment>
        ) => {
            modelCreatorDataStore.setData(prevData => {
                if (prevData.model === null) return prevData;

                return {
                    ...prevData,
                    model: ModelLib.updateCompartment(prevData.model, compartmentId, updates),
                };
            });
        },
        createTransition: (
            startId: CompartmentLib.CompartmentId,
            endId: CompartmentLib.CompartmentId
        ) => {
            modelCreatorDataStore.setData(prevData => {
                if (prevData.model === null) return prevData;

                const newTransition = TransitionLib.create(startId, endId, transitionIdRef.current++);

                return {
                    ...prevData,
                    model: ModelLib.addTransition(prevData.model, newTransition),
                };
            })
        },
        transitionCreatorStart: null,
        transitionCreatorEnd: null,
        setTransitionCreatorStart: (compartment: CompartmentLib.CompartmentId | null) => {
            modelCreatorDataStore.setData(prevData => {
                return {
                    ...prevData,
                    transitionCreatorStart: compartment,
                };
            })
        },
        setTransitionCreatorEnd: (compartment: CompartmentLib.CompartmentId | null) => {
            modelCreatorDataStore.setData(prevData => {
                return {
                    ...prevData,
                    transitionCreatorEnd: compartment,
                };
            })
        },
        setModelName: (name: string) => {
            if (name.length == 0) return;
            modelCreatorDataStore.setData(prevData => { 
                if (prevData.model === null) return prevData;

                return {
                    ...prevData,
                    model: ModelLib.setName(prevData.model, name),
                };
            });
        },
        focus: FocusLib.createFocus(),
        addToFocus: (obj: FocusLib.Focusable) => {
            modelCreatorDataStore.setData(prevData => ({
                ...prevData,
                focus: FocusLib.addToFocus(prevData.focus, obj),
            }));
        },
        removeFromFocus: (callbackFn: ((obj: FocusLib.Focusable) => boolean)) => {
            modelCreatorDataStore.setData(prevData => ({
                ...prevData,
                focus: FocusLib.removeFromFocus(prevData.focus, callbackFn),
            }));
        },
        resetFocus: () => {
            modelCreatorDataStore.setData(prevData => ({
                ...prevData,
                focus: FocusLib.resetFocus(prevData.focus),
            }));
        }
    }), []);

    React.useEffect(() => {
        (async () => {
            const model = await restApi.getUserModel(authContextData, safeModelId);

            if (model === null) {
                console.log("Model with ID '" + safeModelId + "' not found");
                return;
            }

            let highestCompartmentId = -1;
            let highestTransitionId = -1;

            model.compartments.forEach(compartment => {
                if (compartment.id > highestCompartmentId) highestCompartmentId = compartment.id;
            });

            model.transitions.forEach(transition => {
                if (transition.id > highestTransitionId) highestTransitionId = transition.id;
            })

            compartmentIdRef.current = highestCompartmentId + 1;
            transitionIdRef.current = highestTransitionId + 1;
            modelCreatorDataStore.setData(prevData => ({ ...prevData, model }));
        })();
    }, []);

    // wait for model to load

    // need to manually subscribe to track changes
    const currentModel = React.useSyncExternalStore(
        modelCreatorDataStore.subscribe,
        () => modelCreatorDataStore.getSnapshot().model,
    );

    if (currentModel === null) {
        return <LargeLoader message="Loading model..."/>;
    }

    // render the editor

    return (
        <ModelCreatorContext.Provider value={modelCreatorDataStore}>
            <ModelCreatorNavbar />
            <main className="grid grid-cols-2 h-full w-full" style={{ gridTemplateColumns: "1fr 3fr" }}>
                    <div className="bg-tertiary col-start-1 col-span-1">
                        <Toolbox></Toolbox>
                    </div>
                    <div className="col-start-2 col-span-1 bg-model-creator-canvas">
                        <Canvas ref={canvasRef}></Canvas>
                    </div>
            </main>
        </ModelCreatorContext.Provider>
)
}