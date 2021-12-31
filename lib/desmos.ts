import {State} from "./desmosState";

export interface Calculator {
    getState: () => State;
    setState: (state: State) => {};
}

export interface Desmos {
    GraphingCalculator: (el: HTMLElement | null, options: DesmosOptions) => Calculator;
}

export interface DesmosOptions {
    expressionsCollapsed: boolean;
}