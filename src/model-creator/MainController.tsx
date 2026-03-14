import React from 'react';
import { useParams } from 'react-router-dom';

import Toolbox from './components/toolbox/Toolbox.tsx';
import Canvas from './components/Canvas.tsx';
import ModelCreatorNavbar from './components/Navbar.tsx';
import { type CompartmentProps } from './components/compartment/Compartment.tsx';
import { ModelLib, CompartmentLib, TransitionLib, FocusLib } from './system/index.ts';
import { ModelCreatorContext, type ModelCreatorContextData } from './ModelCreatorContext.ts';
import { Mode } from './enums/Mode.ts';
import restApi from '../rest-api/restApi.ts';
import { useAuth } from '../auth/index.ts';

import './model-creator.css';
import LargeLoader from '../components/LargeLoader.tsx';

export default function MainController() {
    const [model, setModel] = React.useState<ModelLib.Model | null>(null)
    const [mode, setMode] = React.useState<Mode>(Mode.DEFAULT);
    const [focus, setFocus] = React.useState<FocusLib.Focus>(FocusLib.createFocus());
    const [transitionCreatorStart, setTransitionCreatorStart] = React.useState<CompartmentLib.CompartmentId | null>(null);
    const [transitionCreatorEnd, setTransitionCreatorEnd] = React.useState<CompartmentLib.CompartmentId | null>(null);

    const canvasRef: ModelCreatorContextData["canvasRef"] = React.useRef(null);
    const compartmentIdRef = React.useRef<CompartmentLib.CompartmentId>(0);
    const transitionIdRef = React.useRef<CompartmentLib.CompartmentId>(0);

    const authContextData = useAuth();
    const { modelId } = useParams();
    const safeModelId = modelId ?? "";

    // helper functions

    const createCompartmentDeleteHandler = (id: CompartmentLib.CompartmentId): CompartmentProps["deleteSelf"] => {
        return () => {
            setModel(prev => {
                if (prev === null) return null;
                return ModelLib.removeCompartment(prev, id);
            });
        }
    };

    const createCompartment = (name: string, x: number, y: number) => {
        const newCompartment = CompartmentLib.create(name, x, y, compartmentIdRef.current);

        setModel(prev => {
            if (prev === null) return null;

            const newModel = ModelLib.addCompartment(prev, newCompartment)

            // TODO: make this incrementation work with react strict mode
            if (newModel !== prev) compartmentIdRef.current++;

            return newModel;
        });
    };

    const updateCompartment = (compartmentId: CompartmentLib.CompartmentId, updates: Partial<CompartmentLib.Compartment>) => {
        setModel(prev => {
            if (prev === null) return null;
            return ModelLib.updateCompartment(prev, compartmentId, updates);
        });
    }

    const createTransition = (startId: CompartmentLib.CompartmentId, endId: CompartmentLib.CompartmentId) => {
        const newTransition = TransitionLib.create(startId, endId, transitionIdRef.current);

        setModel(prev => {
            if (prev === null) return null;

            const newModel = ModelLib.addTransition(prev, newTransition);

            // TODO: make this incrementation work with react strict mode
            if (newModel !== prev) transitionIdRef.current++;

            return newModel;
        })
    };

    const setModelName = (name: string) => {
        setModel(prev => {
            if (prev === null) return null;
            return {
                ...prev,
                modelName: name
            };
        });

        if (model !== null) restApi.setUserModelName(authContextData, model.id, name);
    };

    const addToFocus = (obj: FocusLib.Focusable) => {
        setFocus(prev => FocusLib.addToFocus(prev, obj));
    }

    const removeFromFocus = (callbackFn: (obj: FocusLib.Focusable) => boolean) => {
        setFocus(prev => FocusLib.removeFromFocus(prev, callbackFn));
    }

    const resetFocus = () => {
        setFocus(prev => {
            return FocusLib.resetFocus(prev)
        });
    }

    // initialize the model

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
            setModel(model);
        })();
    }, []);

    // wait for model to load

    if (model === null) {
        return <LargeLoader message="Loading model..."/>;
    }

    // render the editor

    return (
        <ModelCreatorContext.Provider value={{
            model, mode, canvasRef, setMode, createCompartmentDeleteHandler, createCompartment, updateCompartment,
            createTransition, transitionCreatorStart, transitionCreatorEnd, setTransitionCreatorEnd, 
            setTransitionCreatorStart, setModelName, focus, addToFocus, removeFromFocus, resetFocus
        }}>
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