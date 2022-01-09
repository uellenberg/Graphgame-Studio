import git, {GitAuth, PushResult} from "isomorphic-git";
import {fs, readdir} from "./files";
import http from "isomorphic-git/http/web";
import Path from "path";

export const Clone = async (repo: string, folder: string, auth: () => Promise<GitAuth>) : Promise<Error | undefined> => {
    try {
        await git.clone({
            fs,
            http,
            dir: folder,
            corsProxy: "https://cors.isomorphic-git.org",
            url: repo,
            onAuth: url => {
                //Check if we have the key stored.
                const key = localStorage.getItem("gh-token");
                if(key) return {username: key, password: "x-oauth-basic"};

                //If we don't, send them to GitHub oauth.
                return auth();
            },
            onAuthFailure: () => auth()
        });
    } catch(e) {
        return <Error>e;
    }
};

export const GetGitDir = async (folder: string) : Promise<string | null> => {
    let searchPath = "/";

    let gitDir: string | null = null;

    //This goes through the directory tree, starting at the lowest directory.
    //In each directory, we search for a .git directory, and if it exists,
    //we set gitDir to it. In the end, gitDir will be the git directory closest
    //to us, or null if there is no git directory.
    for (const dir of folder.split(/\//g)) {
        const path = Path.resolve(searchPath, dir);

        const files = <string[] | null>await readdir(path);
        if(files?.includes(".git")) gitDir = path;

        searchPath = path;
    }

    return gitDir;
};

export const IsUserSetup = async (folder: string) : Promise<boolean> => {
    const name = await git.getConfig({
        fs,
        dir: folder,
        path: "user.name"
    });

    const email = await git.getConfig({
        fs,
        dir: folder,
        path: "user.email"
    });

    //Return if both the name and email are setup.
    //If they aren't, we'll prompt the user for them.
    return name && email;
};

export const SetupUser = async (folder: string, name: string, email: string) : Promise<void> => {
    await git.setConfig({
        fs,
        dir: folder,
        path: "user.name",
        value: name
    });

    await git.setConfig({
        fs,
        dir: folder,
        path: "user.email",
        value: email
    });
};

export const Commit = async (folder: string, message: string, auth: () => Promise<GitAuth>) : Promise<PushResult | Error> => {
    try {
        //First, we need to add every file.
        //We'll use statusMatrix to find all the files that have changed.
        const status = await git.statusMatrix({ fs, dir: folder });

        for(const file of status) {
            //Make sure that the status of the file (2) is different than the staged file (3).
            if(file[2] === file[3]) continue;

            //Get the file name (0).
            const name = file[0];

            //If it's 0, then the file is deleted, so we should remove it instead of adding it. Otherwise, we can add it, as it's been changed.
            if(file[2] === 0) {
                //Remove the file.
                await git.remove({
                    fs,
                    dir: folder,
                    filepath: name
                });
            } else {
                //Add the file.
                await git.add({
                    fs,
                    dir: folder,
                    filepath: name
                });
            }
        }

        //Make a commit with the specified message.
        await git.commit({
            fs,
            dir: folder,
            message
        });

        //Push the new commit and return the result.
        return await git.push({
            fs,
            http,
            dir: folder,
            corsProxy: "https://cors.isomorphic-git.org",
            onAuth: url => {
                //Check if we have the key stored.
                const key = localStorage.getItem("gh-token");
                if(key) return {username: key, password: "x-oauth-basic"};

                //If we don't, send them to GitHub oauth.
                return auth();
            },
            onAuthFailure: () => auth()
        });
    } catch(e) {
        return <Error>e;
    }
};

export const Pull = async (folder: string, auth: () => Promise<GitAuth>) : Promise<Error | undefined> => {
    try {
        //First, get the status to see if the pull creates a merge commit.
        const last_commit = (await git.log({fs, dir: folder}))[0].oid;

        //Next, pull.
        await git.pull({
            fs,
            http,
            dir: folder,
            corsProxy: "https://cors.isomorphic-git.org",
            onAuth: url => {
                //Check if we have the key stored.
                const key = localStorage.getItem("gh-token");
                if(key) return {username: key, password: "x-oauth-basic"};

                //If we don't, send them to GitHub oauth.
                return auth();
            },
            onAuthFailure: () => auth()
        });

        //See if the new last commit is different.
        const new_last_commit = (await git.log({fs, dir: folder}))[0].oid;

        if(last_commit !== new_last_commit) {
            //In case the pull created a merge commit, push as well.
            await git.push({
                fs,
                http,
                dir: folder,
                corsProxy: "https://cors.isomorphic-git.org",
                onAuth: url => {
                    //Check if we have the key stored.
                    const key = localStorage.getItem("gh-token");
                    if (key) return {username: key, password: "x-oauth-basic"};

                    //If we don't, send them to GitHub oauth.
                    return auth();
                },
                onAuthFailure: () => auth()
            });
        }
    } catch(e) {
        return <Error>e;
    }
};