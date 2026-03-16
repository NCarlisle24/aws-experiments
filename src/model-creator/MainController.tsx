// react

import React from 'react';
import { useParams } from 'react-router-dom';

// components

import Toolbox from './components/toolbox/Toolbox.tsx';
import Canvas from './components/Canvas.tsx';
import ModelCreatorNavbar from './components/Navbar.tsx';
import LargeLoader from '../components/LargeLoader.tsx';
import ContextMenu from './components/ContextMenu.tsx';

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
        contextMenuIsActive:    false,
        contextMenuPos:         { x: 0, y: 0},
        canvasRef,

        setMode: (mode: Mode) => {
            modelCreatorDataStore.setData(prevData => ({ ...prevData, mode }));
        },

        createCompartment: (name: string, x?: number, y?: number): ModelComponentLib.ModelComponentId => {
            const compartmentId = componentIdRef.current++;

            modelCreatorDataStore.setData(prevData => {
                if (prevData.model === null) return prevData;

                const newCompartment = CompartmentLib.createCompartment(
                    compartmentId,
                    name,
                    x,
                    y,
                );

                return {
                    ...prevData,
                    model: ModelLib.addComponent(prevData.model, newCompartment),
                };
            });

            return compartmentId;
        },

        createTransition: (
            startId: ModelComponentLib.ModelComponentId,
            endId: ModelComponentLib.ModelComponentId,
        ): ModelComponentLib.ModelComponentId => {
            const transitionId = componentIdRef.current++;

            modelCreatorDataStore.setData(prevData => {
                if (prevData.model === null) return prevData;

                const newTransition = TransitionLib.createTransition(
                    transitionId,
                    startId,
                    endId,
                );

                return {
                    ...prevData,
                    model: ModelLib.addComponent(prevData.model, newTransition),
                };
            })

            return transitionId;
        },

        deleteComponent: (id: ModelComponentLib.ModelComponentId) => {
            modelCreatorDataStore.setData(prevData => {
                if (prevData.model === null) return prevData;

                // TODO: if the component is in focus, remove it from the set

                return {
                    ...prevData, 
                    model: ModelLib.removeComponent(prevData.model, id),
                };
            });
        },

        updateComponent: (
            id: ModelComponentLib.ModelComponentId,
            updates: Partial<ModelComponentLib.ModelComponent>
        ) => {
            modelCreatorDataStore.setData(prevData => {
                if (prevData.model === null) return prevData;

                return {
                    ...prevData,
                    model: ModelLib.updateComponent(prevData.model, id, updates),
                };
            });
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
        },

        showContextMenu: (x: number, y: number) => {
            modelCreatorDataStore.setData(prevData => ({
                ...prevData,
                contextMenuIsActive: true,
                contextMenuPos: { x, y },
            }));
        },
        
        hideContextMenu: () => {
            modelCreatorDataStore.setData(prevData => ({
                ...prevData,
                contextMenuIsActive: false
            }));
        }
    }), []);

    // initialize model

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
            <main className="grid grid-cols-2 h-full w-full" style={{ gridTemplateColumns: "1fr 3fr" }}
                    onContextMenu={(e) => e.preventDefault()}>

                <div className="bg-tertiary col-start-1 col-span-1">
                    <Toolbox></Toolbox>
                </div>
                <div className="col-start-2 col-span-1 bg-model-creator-canvas">
                    <Canvas ref={canvasRef}></Canvas>
                </div>

                <ContextMenu />

            </main>
        </ModelCreatorContext.Provider>
)
}