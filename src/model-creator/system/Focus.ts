export interface Focusable {
    isInFocus: boolean
};

export interface Focus {
    readonly objects: readonly Focusable[]
}

export const createFocus = (): Focus => {
    return {
        objects: []
    };
}

export const addToFocus = (focus: Focus, obj: Focusable): Focus => {
    obj.isInFocus = true;

    const newFocus: Focus = {
        ...focus,
        objects: [...focus.objects, obj]
    };

    return newFocus;
}

export const resetFocus = (focus: Focus): Focus => {
    if (focus.objects.length == 0) return focus;

    for (const object of focus.objects) {
        object.isInFocus = false;
    }

    const newFocus: Focus = {
        ...focus,
        objects: []
    };

    return newFocus;
}

export const removeIndexFromFocus = (focus: Focus, index: number): Focus => {
    const numObjects = focus.objects.length

    if (index < 0 || index >= numObjects) {
        return focus;
    }

    focus.objects[index].isInFocus = false;

    const newObjects = [...focus.objects.slice(0, index), ...focus.objects.slice(index + 1, numObjects)];

    return {
        ...focus,
        objects: newObjects
    };
}

export const removeFromFocus = (focus: Focus, callbackFn: (obj: Focusable) => boolean): Focus => {
    let foundIndex = -1;

    for (let i = 0; i < focus.objects.length; i++) {
        if (callbackFn(focus.objects[i])) {
            foundIndex = i;
            break;
        }
    }

    if (foundIndex < 0) return focus;

    return removeIndexFromFocus(focus, foundIndex);
}