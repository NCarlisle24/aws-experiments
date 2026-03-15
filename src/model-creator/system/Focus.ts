export interface Focusable { };

export interface Focus {
    readonly objects: readonly Focusable[]
}

export const createFocus = (): Focus => {
    return {
        objects: []
    };
}

export const addToFocus = (focus: Focus, obj: Focusable): Focus => {
    const newFocus: Focus = {
        ...focus,
        objects: [...focus.objects, obj]
    };

    return newFocus;
}

export const resetFocus = (focus: Focus): Focus => {
    if (focus.objects.length == 0) return focus;

    let newFocus = focus;
    while (newFocus.objects.length > 0) {
        newFocus = removeIndexFromFocus(newFocus, newFocus.objects.length - 1);
    }

    return newFocus;
}

export const removeIndexFromFocus = (focus: Focus, index: number): Focus => {
    const numObjects = focus.objects.length

    if (index < 0 || index >= numObjects) {
        return focus;
    }

    const newObjects = [...focus.objects.slice(0, index), ...focus.objects.slice(index + 1, numObjects)];

    return {
        ...focus,
        objects: newObjects
    };
}

export const removeFromFocus = (focus: Focus, callbackFn: (obj: Focusable, index: number) => boolean): Focus => {
    let newFocus = focus;
    for (let i = 0; i < focus.objects.length; i++) {
        if (callbackFn(focus.objects[i], i)) {
            newFocus = removeIndexFromFocus(focus, i);
            i--;
        }
    }

    return newFocus;
}