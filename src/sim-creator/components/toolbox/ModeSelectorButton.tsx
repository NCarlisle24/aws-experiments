import React from 'react';

import { useSimCreator } from '../../SimContext';
import { Mode } from '../../enums/Mode';

interface ModeSelectorButtonProps {
    mode: Mode,
    activeModes: Mode[],
    children: React.ReactNode
}

export default function ModeSelectorButton({ mode, activeModes, children }: ModeSelectorButtonProps) {
    const { mode: currentMode, setMode } = useSimCreator();

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