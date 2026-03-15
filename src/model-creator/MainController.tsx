// react

import React from 'react';
import { useParams } from 'react-router-dom';

// components

import Toolbox from './components/toolbox/Toolbox.tsx';
import Canvas from './components/Canvas.tsx';
import ModelCreatorNavbar from './components/Navbar.tsx';
import LargeLoader from '../components/LargeLoader.tsx';

// context stuff

import restApi from '../rest-api/restApi.ts';
import { useAuth } from '../auth/index.ts';
import { 
    createModelCreatorDataStore,
    ModelCreatorContext,
    type ModelCreatorContextData
} from './ModelCreatorContext.ts';

// misc types

import { Mode } from './enums/Mode.ts';
import { ModelLib, CompartmentLib, TransitionLib, ModelComponentLib } from './system/index.ts';

// styling

import './model-creator.css';

// component

export default function MainController() {
    const canvasRef: ModelCreatorContextData["canvasRef"] = React.useRef(null);
    const componentIdRef = React.useRef<ModelComponentLib.ModelComponentId>(0);

    const authContextData = useAuth();
    const { modelId } = useParams();
    const safeModelId = modelId ?? "";

    // initialize the context data

    const modelCreatorDataStore = React.useMemo(() => createModelCreatorDataStore({
        model:                  null,
        mode:                   Mode.DEFAULT,
        transitionCreatorStart: null,
        transitionCreatorEnd:   null,
        focus:                  new Set(),
        canvasRef,

        setMode: (mode: Mode) => {
            modelCreatorDataStore.setData(prevData => ({ ...prevData, mode }));
        },

        deleteCompartment: (id: ModelComponentLib.ModelComponentId) => {
            modelCreatorDataStore.setData(prevData => {
                if (prevData.model === null) return prevData;

                return {
                    ...prevData, 
                    model: ModelLib.removeCompartment(prevData.model, id),
                };
            });
        },

        createCompartment: (name: string, x?: number, y?: number) => {
            modelCreatorDataStore.setData(prevData => {
                if (prevData.model === null) return prevData;

                const newCompartment = CompartmentLib.createCompartment(
                    componentIdRef.current++,
                    name,
                    x,
                    y,
                );

                return {
                    ...prevData,
                    model: ModelLib.addCompartment(prevData.model, newCompartment),
                };
            });
        },

        updateCompartment: (
            id: ModelComponentLib.ModelComponentId,
            updates: Partial<CompartmentLib.Compartment>
        ) => {
            modelCreatorDataStore.setData(prevData => {
                if (prevData.model === null) return prevData;

                return {
                    ...prevData,
                    model: ModelLib.updateCompartment(prevData.model, id, updates),
                };
            });
        },

        createTransition: (
            startId: ModelComponentLib.ModelComponentId,
            endId: ModelComponentLib.ModelComponentId,
        ) => {
            modelCreatorDataStore.setData(prevData => {
                if (prevData.model === null) return prevData;

                const newTransition = TransitionLib.createTransition(
                    componentIdRef.current++,
                    startId,
                    endId,
                );

                return {
                    ...prevData,
                    model: ModelLib.addTransition(prevData.model, newTransition),
                };
            })
        },

        setTransitionCreatorStart: (compartmentId: ModelComponentLib.ModelComponentId | null) => {
            modelCreatorDataStore.setData(prevData => {
                const newData: ModelCreatorContextData = { ...prevData, transitionCreatorStart: compartmentId };

                if (compartmentId === null) return newData;

                if (!prevData.model || !prevData.model.compartments.has(compartmentId)) return prevData;

                return newData;
            })
        },

        setTransitionCreatorEnd: (compartmentId: ModelComponentLib.ModelComponentId | null) => {
            modelCreatorDataStore.setData(prevData => {
                const newData: ModelCreatorContextData = { ...prevData, transitionCreatorEnd: compartmentId };

                if (compartmentId === null) return newData;

                if (!prevData.model || !prevData.model.compartments.has(compartmentId)) return prevData;

                return newData;
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

        addToFocus: (id: ModelComponentLib.ModelComponentId) => {
            modelCreatorDataStore.setData(prevData => {
                if (prevData.focus.has(id)) return prevData;

                const newFocus = new Set(prevData.focus);
                newFocus.add(id);

                const newData: ModelCreatorContextData = {
                    ...prevData,
                    focus: newFocus
                };

                return newData;
            });
        },

        removeFromFocus: (id: ModelComponentLib.ModelComponentId) => {
            modelCreatorDataStore.setData(prevData => {
                if (!prevData.focus.has(id)) return prevData;

                const newFocus = new Set(prevData.focus);
                newFocus.delete(id);
                
                const newData: ModelCreatorContextData = {
                    ...prevData,
                    focus: newFocus
                };

                return newData;
            });
        },

        resetFocus: () => {
            modelCreatorDataStore.setData(prevData => ({
                ...prevData,
                focus: new Set()
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

            let highestId = -1;

            model.components.forEach(component => {
                if (component.id > highestId) highestId = component.id;
            });

            componentIdRef.current = highestId + 1;
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