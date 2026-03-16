import React from 'react';
import { useModelCreator, type ModelCreatorContextData } from '../ModelCreatorContext';

export interface ContextMenuButtonProps {
    children: React.ReactNode,
    onClick: (e: React.MouseEvent) => any,
}

const contextDataSelector = (data: ModelCreatorContextData) => ({
    hideContextMenu: data.hideContextMenu,
});

export default function ContextMenuButton({ children, onClick }: ContextMenuButtonProps) {
    const { hideContextMenu } = useModelCreator(contextDataSelector);

    const handleClick = React.useCallback((e: React.MouseEvent) => {
        onClick(e);
        hideContextMenu();
    }, [onClick, hideContextMenu])
        
    return (
        <div className="cursor-pointer hover:bg-gray-200 rounded-sm px-2 py-1 w-full"
             onClick={handleClick}>
            {children}
        </div>
    );
}