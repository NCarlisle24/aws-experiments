import React from 'react';

import { ModelLib, CompartmentLib } from './system/index.ts';
import { Mode } from './enums/Mode.ts';
import type { Focus, Focusable } from './system/Focus.ts';

// interface

export interface ModelCreatorContextData {
    readonly model: ModelLib.Model | null;
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

type DataSelection = Partial<ModelCreatorContextData>;

export const useModelCreator = <Selection extends DataSelection>(
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

const selectionsAreEqual = <S extends DataSelection>(selection1: S | null, selection2: S | null): boolean => {
    if (selection1 === null || selection2 === null) return false;
    if (Object.is(selection1, selection2)) return true;

    const keys = Object.keys(selection1) as (keyof S)[];
    for (const key of keys) {
        if (!Object.is(selection1[key], selection2[key])) return false;
    }

    return true;
}