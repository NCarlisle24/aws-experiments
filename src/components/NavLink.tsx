import { type Route } from '../router.tsx';
import React from 'react';

interface NavLinkProps {
    dest: Route,
    children: React.ReactNode
};

export default function NavLink({ dest, children }: NavLinkProps) {
    return (
        <a href={dest} className="h-full flex flex-col justify-center items-center">
            {children}
        </a>
    );
}