import Path from "path";
import {readdir} from "./files";

export const FindMain = async (path: string) : Promise<string | null> => {
    let folderPath = Path.dirname(path);

    let searchPath = "/";

    //This goes through the directory tree, starting at the lowest directory.
    //In each directory, we search for a main.lm, and if we find one, we return it.
    //If we don't, we go up a level. If in the end there is no main, we return null.
    for (const dir of folderPath.split(/\//g)) {
        const path = Path.resolve(searchPath, dir);

        const files = <string[] | null>await readdir(path);
        if(files?.includes("main.lm")) return Path.join(path, "main.lm");

        searchPath = path;
    }

    return null;
}