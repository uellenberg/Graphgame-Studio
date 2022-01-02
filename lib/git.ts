import git, {GitAuth} from "isomorphic-git";
import {fs} from "./files";
import http from "isomorphic-git/http/web";

export const Clone = async (repo: string, folder: string, auth: () => Promise<GitAuth>, done: () => void) : Promise<void> => {
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

    done();
}