import {Compile, TemplateModule} from "logimat";
import * as Path from "path";
import * as graphgame from "graphgame";
import {DragMode, ExpressionState, ListState, State} from "../desmosState";
import {readdir, readFile} from "./worker-files";

let simplificationMap: Record<string, string> = {};

let oldMain = "";

export const compile = async (path: string, force = false) : Promise<ListState | null> => {
    //Search for a main file directly under us.
    const main = await findMain(path);
    if(!main || (!force && main === oldMain)) return null;
    oldMain = main;

    //Compile the main file, supplying graphgame as an import.
    //Simplification map allows us to skip simplification for items that have already been simplified, in order to drastically reduce compile time.
    const output = <{output: string[], simplificationMap: Record<string, string>}>(await Compile((await readFile(main) as Buffer)?.toString() || "", false, false, Path.resolve(Path.dirname(main)), true, true, true, simplificationMap, {graphgame: <TemplateModule><unknown>graphgame}));
    simplificationMap = output.simplificationMap;

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

const findMain = async (path: string) : Promise<string | null> => {
    let folderPath = Path.dirname(path);

    let searchPath = "/";

    //This goes through the directory tree, starting at the lowest directory.
    //In each directory, we search for a main.lm, and if we find one, we return it.
    //If we don't, we go up a level. If in the end there is no main, we return null.
    for (const dir of folderPath.split(/\//g)) {
        const path = Path.resolve(searchPath, dir);

        if((await readdir(path))?.includes("main.lm")) return Path.join(path, "main.lm");

        searchPath = path;
    }

    return null;
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
        case "opacity":
            state.lineOpacity = value;
            break;
        case "thickness":
            state.lineWidth = value;
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
            state.label = value;
            break;
        case "drag":
            state.dragMode = <DragMode>value.toUpperCase();
            break;
    }
}