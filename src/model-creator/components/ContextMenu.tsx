import React from "react";
import { useModelCreator, type ModelCreatorContextData } from "../ModelCreatorContext"
import ContextMenuButton from "./ContextMenuButton";

const contextDataSelector = (data: ModelCreatorContextData) => ({
    isActive:        data.contextMenuIsActive,
    pos:             data.contextMenuPos,
    focus:           data.focus,
    hideMenu:        data.hideContextMenu,
    deleteComponent: data.deleteComponent,
    resetFocus:      data.resetFocus,
});

export default function ContextMenu() {
    const menuRef = React.useRef<HTMLDivElement>(null);
    const { isActive, pos, focus, hideMenu, deleteComponent, resetFocus } = useModelCreator(contextDataSelector);
    const focusedComponentIds = React.useMemo(() => Array.from(focus), [focus]);

    const style: React.CSSProperties = {
        top: pos.y,
        left: pos.x
    };

    // watch for clicks outside of context menu

    const handleMouseDown = React.useCallback((e: MouseEvent) => {
        if (!isActive) return;

        const menuRect = menuRef.current!.getBoundingClientRect();
        const mousePos = { x: e.clientX, y: e.clientY };

        if (mousePos.x < menuRect.left
            || mousePos.x > menuRect.right 
            || mousePos.y < menuRect.top
            || mousePos.y > menuRect.bottom
        ) {
            hideMenu();
        }
    }, [isActive, hideMenu]);

    React.useEffect(() => {
        window.addEventListener("mousedown", handleMouseDown);
        return () => window.removeEventListener("mousedown", handleMouseDown);
    }, [handleMouseDown]);
    
    // button handlers

    const deleteSelectedComponents = React.useCallback(() => {
        if (focusedComponentIds.length == 0) return;

        const idsToDelete = [...focusedComponentIds];

        for (const idToDelete of idsToDelete) {
            deleteComponent(idToDelete);
        }

        resetFocus();

    }, [focusedComponentIds]);

    // const renameCompartment = React.useCallback(() => {
    //     if (focusedComponentIds.length != 1) return;

    // }, [focusedComponentIds]);

    // render

    if (!isActive) return;

    return (
        <div className="fixed text-black bg-white border-black border z-2048 p-2 w-60"
             style={style} ref={menuRef}>
            <ContextMenuButton onClick={deleteSelectedComponents}>Delete selected</ContextMenuButton>
        </div>
    );
}