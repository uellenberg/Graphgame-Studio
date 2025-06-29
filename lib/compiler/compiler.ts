import {Compile, TemplateModule} from "logimat";
import * as Path from "path";
import * as graphgame from "graphgame";
import * as calculatoros from "calculatoros";
import {DragMode, ExpressionState, ItemState} from "../desmosState";
import {readFile} from "./worker-files";

let simplificationMap: Record<string, string> = {};
let importMap: Record<string, TemplateModule | string> = {
    graphgame: <TemplateModule><unknown>graphgame,
    calculatoros: <TemplateModule><unknown>calculatoros,
};

let oldMain = "";

export const compile = async (main: string) : Promise<ItemState[] | null> => {
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
    const output = <{output: string[], simplificationMap: Record<string, string>, importMap: Record<string, TemplateModule | string>}>(await Compile((await readFile(main) as Buffer)?.toString() || "", false, false, Path.resolve(main), true, true, true, true, Object.assign({}, simplificationMap), Object.assign({}, importMap)));
    simplificationMap = output.simplificationMap;
    importMap = output.importMap;

    //TODO: Show errors to user.

    //These expressions are either normal expressions, or expressions of the form !key=value.
    //These types of expressions control the state of the normal expression that comes after them (for example, to control the color).
    const expressions = output.output;

    let additionalState: Partial<ExpressionState> = {};

    const expressionsStateByFolder: Record<string, ExpressionState[]> = {};
    const finalExpressions: ItemState[] = [];
    const folders: string[] = [];

    let id = 0;

    for(const expression of expressions) {
        if(expression.startsWith("!")) {
            HandleDisplay(expression.substring(1), additionalState, folders);
        } else {
            const expressionObj = {
                type: "expression",
                latex: expression,
                id: (id++).toString(),
                ...additionalState
            } as ExpressionState;

            if(expressionObj.folderId) {
                if(!(expressionObj.folderId in expressionsStateByFolder)) {
                    expressionsStateByFolder[expressionObj.folderId] = [];
                }

                expressionsStateByFolder[expressionObj.folderId].push(expressionObj);
            } else {
                finalExpressions.push(expressionObj);
            }

            additionalState = {};
        }
    }

    // Now, we need to build the folders.
    for(const folderText in expressionsStateByFolder) {
        const folderID = (id++).toString();
        finalExpressions.push({
            type: "folder",
            id: folderID,
            title: folderText,
            collapsed: true,
        });

        for(const expression of expressionsStateByFolder[folderText]) {
            finalExpressions.push({
                ...expression,
                folderId: folderID,
            });
        }
    }

    return finalExpressions;
}

const HandleDisplay = (val: string, state: Partial<ExpressionState>, folders: string[]) : void => {
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

            if(value === "0") state.lines = false;
            break;
        case "thickness":
            state.lineWidth = value;
            state.pointSize = value;

            if(value === "0") state.lines = false;
            break;
        case "fill":
            state.fillOpacity = value;

            if(value === "0") state.fill = false;
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
        case "min":
            if(!state.slider) state.slider = {};
            state.slider.min = value;
            state.slider.hardMin = true;
            break;
        case "max":
            if(!state.slider) state.slider = {};
            state.slider.max = value;
            state.slider.hardMax = true;
            break;
        case "step":
            if(!state.slider) state.slider = {};
            state.slider.step = value;
            break;
        case "folder":
            state.folderId = value;
            if(!folders.includes(value)) folders.push(value);
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
        graphgame: <TemplateModule><unknown>graphgame,
        calculatoros: <TemplateModule><unknown>calculatoros,
    };
}
