import React, {useEffect} from "react";
import {Calculator, Desmos} from "../../lib/desmos";

declare global {
    interface Window {
        Calc: Calculator;
        Desmos: Desmos;
    }
}

/*
The main display component. Handles displaying a Desmos window.
 */
export default function Display() {
    useEffect(() => {
        if(!window.Calc) window.Calc = window.Desmos.GraphingCalculator(document.getElementById("desmos"), {expressionsCollapsed: false});
    }, []);

    return (
        <div id="desmos"/>
    );
}