import React, {useEffect} from "react";
import {Calculator, Desmos} from "../../lib/desmos";

/*
The main display component. Handles displaying a Desmos window.
 */
const Display = React.memo(() => {
    useEffect(() => {
        if(!window.Calc) window.Calc = window.Desmos.GraphingCalculator(document.getElementById("desmos"), {expressionsCollapsed: true});
    }, []);

    return (
        <div id="desmos"/>
    );
});

export default Display;