import React from 'react';

import { useModelCreator, type ModelCreatorContextData } from '../../ModelCreatorContext';
import { Mode } from '../../enums/Mode';

interface ModeSelectorButtonProps {
    mode: Mode,
    activeModes: Mode[],
    children: React.ReactNode
}

const contextDataSelector = (data: ModelCreatorContextData) => ({
    currentMode: data.mode,
    setMode: data.setMode 
});

export default function ModeSelectorButton({ mode, activeModes, children }: ModeSelectorButtonProps) {
    const { currentMode, setMode } = useModelCreator(contextDataSelector);

    let isActive = false;
    for (const activeMode of activeModes) {
        if (Mode.isEqual(currentMode, activeMode)) {
            isActive = true;
            break;
        }
    }

    const onClick = () => {
        setMode(mode);
    }

    const style: React.CSSProperties = {
        backgroundColor: isActive ? "var(--color-mode-selector-button-selected)" : "var(--color-mode-selector-button-unselected)",
    };

    return (
        <div className="w-10 h-10 rounded-sm" style={style} onClick={onClick}>
            {children}
        </div>
    );
}