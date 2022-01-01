import {Compile, TemplateModule} from "logimat";
import {FindMain, readFile} from "../files";
import * as Path from "path";
import * as graphgame from "graphgame";

let simplificationMap: Record<string, string> = {};

export const compile = async (path: string) : Promise<void> => {
    const main = await FindMain(path);
    if(!main) return;

    const output = <{output: string[], simplificationMap: Record<string, string>}>(await Compile((await readFile(main) as Buffer)?.toString() || "", false, false, Path.dirname(main), true, true, true, simplificationMap, {graphgame: <TemplateModule><unknown>graphgame}));
    simplificationMap = output.simplificationMap;

    //TODO: Turn output into Desmos state.
}