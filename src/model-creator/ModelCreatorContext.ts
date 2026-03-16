import React from 'react';

import { ModelLib, ModelComponentLib } from './system';
import { Mode } from './enums/Mode.ts';

// interface
// TODO: add cursor as an option so that the cursor can be set globally

export type Focus = ReadonlySet<ModelComponentLib.ModelComponentId>;

export interface ModelCreatorContextData {
    readonly model:                     ModelLib.Model | null;
    readonly mode:                      Mode;
    readonly focus:                     Focus;
    readonly canvasRef:                 React.RefObject<HTMLDivElement | null>;
    readonly transitionCreatorStart:    ModelComponentLib.ModelComponentId | null;
    readonly transitionCreatorEnd:      ModelComponentLib.ModelComponentId | null;
    readonly contextMenuIsActive:       boolean;
    readonly contextMenuPos:            { x: number, y: number };

    readonly setMode:                   (mode: Mode) => any;

    readonly addToFocus:                (id: ModelComponentLib.ModelComponentId) => any;
    readonly removeFromFocus:           (id: ModelComponentLib.ModelComponentId) => any;
    readonly resetFocus:                () => any;

    readonly setModelName:              (name: string) => any;

    readonly createCompartment:         (name: string, x: number, y: number) => ModelComponentLib.ModelComponentId;
    readonly createTransition:          (startId: ModelComponentLib.ModelComponentId, endId: ModelComponentLib.ModelComponentId) => ModelComponentLib.ModelComponentId;
    readonly deleteComponent:           (id: ModelComponentLib.ModelComponentId) => any;
    readonly updateComponent:           (id: ModelComponentLib.ModelComponentId, updates: Partial<ModelComponentLib.ModelComponent>) => any,

    readonly setTransitionCreatorStart: (compartmentId: ModelComponentLib.ModelComponentId | null) => any,
    readonly setTransitionCreatorEnd:   (compartmentId: ModelComponentLib.ModelComponentId | null) => any,

    readonly showContextMenu:           (x: number, y: number) => any;
    readonly hideContextMenu:           () => any;
}

// data store

type DataListener = () => any;

export const createModelCreatorDataStore = (initialData: ModelCreatorContextData) => {
    let data: ModelCreatorContextData = initialData;
    const listeners = new Set<DataListener>();

    const getSnapshot = () => { return data; };

    const setData = (update: (prevData: ModelCreatorContextData) => ModelCreatorContextData) => {
        data = update(data);
        listeners.forEach(listener => listener());
    }

    const subscribe = (subscriber: DataListener) => {
        listeners.add(subscriber);
        return () => listeners.delete(subscriber);
    };

    return { getSnapshot, setData, subscribe };
}

export type ModelCreatorContextDataStore = ReturnType<typeof createModelCreatorDataStore>;

// context + hook

export const ModelCreatorContext = React.createContext<ModelCreatorContextDataStore | null>(null);

export const useModelCreator = <Selection extends Object>(
    selector: (currData: ModelCreatorContextData) => Selection
): Selection => {
    const dataStore = React.useContext(ModelCreatorContext);

    if (!dataStore) {
        throw new Error("useModelCreator must be used within a ModelCreatorContext provider.");
    }

    const prevData = React.useRef<ModelCreatorContextData>(dataStore.getSnapshot());
    const prevSelection = React.useRef<Selection>(selector(prevData.current));

    /**
     * Queries the current store with the user-passed selection. If the selection is "equivalent" to what it was before,
     * the previous selection is returned. Otherwise, the new selection is returned. selector() must return a new
     * object reference for this to work properly.
     */
    const getSelection = React.useCallback(() => {
        const currData = dataStore.getSnapshot();
        const currSelection = selector(currData);

        if (prevData.current === currData 
            || selectionsAreEqual(currSelection, prevSelection.current)) return prevSelection.current;

        prevData.current = currData;
        prevSelection.current = currSelection;
        return currSelection;
    }, [dataStore, selector]);

    return React.useSyncExternalStore(
        dataStore.subscribe,
        getSelection
    );
};

// helper functions

const selectionsAreEqual = <S extends Object>(selection1: S | null, selection2: S | null): boolean => {
    if (selection1 === null || selection2 === null) return false;
    if (Object.is(selection1, selection2)) return true;

    const keys = Object.keys(selection1) as (keyof S)[];
    for (const key of keys) {
        if (!Object.is(selection1[key], selection2[key])) return false;
    }

    return true;
}