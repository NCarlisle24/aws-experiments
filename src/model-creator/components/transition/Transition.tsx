import { type CompartmentElement } from "../compartment/Compartment";

import Xarrow from "react-xarrows";
import React from 'react';

export interface TransitionProps {
    start: React.RefObject<CompartmentElement | null>,
    end: React.RefObject<CompartmentElement | null>
};

export default function Transition({ start, end }: TransitionProps) {
    return (
        <Xarrow start={start} end={end} path="straight"/>
    );
}