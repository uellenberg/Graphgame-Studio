import {Compile, TemplateModule} from "logimat";
import * as Path from "path";
import * as graphgame from "graphgame";
import {DragMode, ExpressionState, ListState, State} from "../desmosState";
import {readdir, readFile} from "./worker-files";

let simplificationMap: Record<string, string> = {};
let importMap: Record<string, TemplateModule | string> = {
    graphgame: <TemplateModule><unknown>graphgame
};

let oldMain = "";

export const compile = async (main: string) : Promise<ListState | null> => {
    //Return if we don't have a main, return nothing.
    if(!main) return null;

    //If the main changed, reset our input and simplification maps.
    if(oldMain !== main) {
        simplificationMap = {};
        ResetImports();
    }

    oldMain = main;

    //Compile the main file, supplying graphgame as an import.
    //Simplification map allows us to skip simplification for items that have already been simplified, in order to drastically reduce compile time.
    const output = <{output: string[], simplificationMap: Record<string, string>, importMap: Record<string, TemplateModule | string>}>(await Compile((await readFile(main) as Buffer)?.toString() || "", false, false, Path.resolve(main), true, true, true, Object.assign({}, simplificationMap), Object.assign({}, importMap)));
    simplificationMap = output.simplificationMap;
    importMap = output.importMap;

    //TODO: Show errors to user.

    //These expressions are either normal expressions, or expressions of the form !key=value.
    //These types of expressions control the state of the normal expression that comes after them (for example, to control the color).
    const expressions = output.output;

    let additionalState: Partial<ExpressionState> = {};

    const expressionsState: ListState = [];

    for(const expression of expressions) {
        if(expression.startsWith("!")) {
            HandleDisplay(expression.substring(1), additionalState);
        } else {
            //@ts-ignore
            expressionsState.push({
                type: "expression",
                latex: expression,
                ...additionalState
            });
            additionalState = {};
        }
    }

    return expressionsState;
}

const HandleDisplay = (val: string, state: Partial<ExpressionState>) : void => {
    //Split by "=" once.
    const index = val.indexOf("=");
    const key = val.slice(0, index);
    const value = val.slice(index+1);

    switch(key) {
        case "color":
            state.colorLatex = value;
            break;
        case "stroke":
            state.lineOpacity = value;
            state.pointOpacity = value;
            break;
        case "thickness":
            state.lineWidth = value;
            state.pointSize = value;
            break;
        case "fill":
            state.fillOpacity = value;
            break;
        case "click":
            state.clickableInfo = {
                enabled: true,
                latex: value
            };
            break;
        case "label":
            state.showLabel = true;
            state.label = value;
            break;
        case "drag":
            state.dragMode = <DragMode>value.toUpperCase();
            break;
        case "hidden":
            state.hidden = value === "true";
            break;
        case "outline":
            state.suppressTextOutline = value === "false";
            break;
        case "angle":
            state.labelAngle = value;
            break;
        case "size":
            state.labelSize = value;
            break;
    }
}

export const ResetPath = (path: string) => {
    //Delete a path from the import map if it has been modified.
    delete importMap[path];
}

export const ResetImports = () => {
    //Delete all imports if a large change has occurred (git clone/pull, etc) or if the main changed.
    importMap = {
        graphgame: <TemplateModule><unknown>graphgame
    };
}
