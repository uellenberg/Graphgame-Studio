import React, {useEffect, useRef, useState} from "react";
import {FileManager} from "devextreme-react";
import {
    exists,
    FileTree,
    GetTree,
    lstat,
    mkdir,
    mkdirRecursive,
    readdir,
    rename,
    rmdirRecursive, unlink,
    writeFile
} from "../../lib/files";
import {FileSelectionItem, Item, ItemView, Toolbar} from "devextreme-react/file-manager";
import * as Path from "path";
import {
    DirectoryCreatedEvent,
    FileUploadedEvent, ItemDeletedEvent,
    ItemDownloadingEvent, ItemMovedEvent,
    ItemRenamedEvent, SelectedFileOpenedEvent,
    ToolbarItemClickEvent
} from "devextreme/ui/file_manager";
import {Clone, Commit, GetGitDir, IsUserSetup, Pull, SetupUser} from "../../lib/git";
import GithubAuth from "./GithubAuth";
import {GitAuth} from "isomorphic-git";
import GithubClone from "./GithubClone";
import GithubCommit from "./GithubCommit";
import GithubDetails from "./GithubDetails";
import {toast} from "react-toastify";

const Files = ({setFile, resetFile, resetAll}: {setFile: (file: string) => void, resetFile: (file: string) => void, resetAll: () => void}) => {
    const [fsData, setFSData] = useState<FileTree | null>(null);

    const refresh = () => {
        GetTree().then(val => {
            setFSData(val);
            fileManagerRef.current?.instance.refresh();
        });
    };

    useEffect(() => {
        refresh();
    }, []);

    const fileManagerRef = React.createRef<FileManager>();

    const onAddClick = ({itemData, viewArea, fileSystemItem}: {itemData: any, viewArea: any, fileSystemItem: any}) => {
        //Make sure we are clicking an option and not the main button.
        if(!itemData.extension) return;

        createFile(itemData.extension as string, fileSystemItem).then(file => {
            if(file) {
                refresh();
                resetFile(file);
            }
        });
    };

    const createFile = async (fileExtension: string, directory = fileManagerRef.current?.instance.getCurrentDirectory()) : Promise<string> => {
        if (!directory.isDirectory || !fileExtension) {
            return "";
        }

        const path = "/" + (directory.path || "");
        await mkdirRecursive(path);

        const files = await readdir(path) || [];

        //Find all items that are New files, then find the max number for them, and increment that.
        //Starting at -1 makes it return 0 if nothing was found, 1 if 1 thing was found, etc.
        const num = files.reduce<number>((cur, val) => {
            const match = val.match(/New file(?: \((\d+)\))?(\..*)/);
            if(!match) return cur;

            const [_, num, ext] = match;
            if(ext !== fileExtension) return cur;

            const parsedNum = num ? parseInt(num) : 0;
            if(parsedNum > cur) return parsedNum;
            return cur;
        }, -1) + 1;

        let array: FileTree = null as unknown as FileTree;
        if (!directory.dataItem) {
            if(!fsData) return "";
            array = fsData;
        } else {
            array = directory.dataItem.items;
            if (!array) {
                array = [];
                directory.dataItem.items = array;
            }
        }

        const name = num === 0 ? `New file${fileExtension}` : `New file (${num})${fileExtension}`;

        const newItem = {
            __KEY__: Date.now(),
            name,
            isDirectory: false,
            size: 0,
        };

        const file = Path.join(path, name);

        await writeFile(file, "");
        array.push(newItem);

        return file;
    }

    const newFileMenuOptions = {
        items: [
            {
                text: "Create new file",
                icon: "plus",
                items: [
                    {
                        text: 'Logimat File',
                        extension: '.lm',
                    },
                    {
                        text: 'Text file',
                        extension: '.txt',
                    },
                ],
            },
        ],
        onItemClick: onAddClick,
    };

    const [githubCloneOpen, setGithubCloneOpen] = useState(false);
    const githubCloneReturn = useRef<(auth: [string, string] | null) => void>(() => {});

    const [githubAuthOpen, setGithubAuthOpen] = useState(false);
    const githubAuthReturn = useRef<(auth: string | null) => void>(() => {});

    const [githubDetailsOpen, setGithubDetailsOpen] = useState(false);
    const githubDetailsReturn = useRef<(auth: [string, string] | null) => void>(() => {});

    const [githubCommitOpen, setGithubCommitOpen] = useState(false);
    const githubCommitReturn = useRef<(auth: string | null) => void>(() => {});

    const onGithubClick = async ({itemData, viewArea, fileSystemItem}: {itemData: any, viewArea: any, fileSystemItem: any}) => {
        //Make sure we are clicking an option and not the main button.
        if(!itemData.type) return;

        const directory = fileManagerRef.current?.instance.getCurrentDirectory();
        if(!directory?.isDirectory) return;

        const path = directory?.path || "";

        switch(itemData.type) {
            case "clone":
                //First, create a new function that will be called when the data is entered.
                //We don't run the old function here because it doesn't have any outstanding promise to resolve.
                githubCloneReturn.current = async (val: [string, string] | null) => {
                    //Close the dialog when it is submitted.
                    setGithubCloneOpen(false);

                    //If no data is returned, don't do anything.
                    if(!val) return;

                    //Clone the specified repository.
                    await clone(val[0], path, val[1]);
                };

                //Finally, open the dialog.
                setGithubCloneOpen(true);
                break;
            case "commit":
                //First, we need to get the git directory.
                const gitDir = await GetGitDir(path);
                //If there is no git directory, we can't commit, so return.
                if(!gitDir) return;

                //Next, we need to ensure that the user has entered their details.
                //If entering them fails, we can return.
                if(!(await ensureAccountDetails(gitDir))) return;

                //Finally, create a new function that will be called when the data is entered.
                //We don't run the old function here because it doesn't have any outstanding promise to resolve.
                githubCommitReturn.current = async (val: string | null) => {
                    //Close the dialog when it is submitted.
                    setGithubCommitOpen(false);

                    //If no data is returned, don't do anything.
                    if(!val) return;

                    //Clone the specified repository.
                    const result = await Commit(gitDir, val, auth);

                    //Display a message.
                    if(result instanceof Error) {
                        toast.error(result.name + ": " + result.message);
                        console.error(result);
                    } else {
                        toast.success("Successfully created commit!");

                        //Reset the file to avoid overrides.
                        setFile("");

                        refresh();
                        resetAll();
                    }
                };

                //Finally, open the dialog.
                setGithubCommitOpen(true);
                break;
            case "pull":
                //First, we need to get the git directory.
                const gitDir1 = await GetGitDir(path);
                //If there is no git directory, we can't commit, so return.
                if(!gitDir1) return;

                //Next, we need to ensure that the user has entered their details.
                //If entering them fails, we can return.
                if(!(await ensureAccountDetails(gitDir1))) return;

                //Pull
                const result = await Pull(gitDir1, auth);

                //Display a message.
                if(result instanceof Error) {
                    toast.error(result.name + ": " + result.message);
                    console.error(result);
                } else {
                    toast.success("Successfully pulled!");

                    //Reset the file to avoid overrides.
                    setFile("");

                    refresh();
                    resetAll();
                }

                break;
        }
    };

    const auth = () : Promise<GitAuth> => {
        return new Promise<GitAuth>((resolve, reject) => {
            //First, resolve the current function.
            githubAuthReturn.current(null);
            //Next, create a new function that will resolve the promise when called.
            githubAuthReturn.current = (val: string | null) => {
                //Close the dialog when it is submitted.
                setGithubAuthOpen(false);

                if(val) {
                    //If a value was provided, save the key and return it.
                    localStorage.setItem("gh-token", val);
                    resolve({username: val, password: "x-oauth-basic"});
                } else {
                    //Otherwise, return null.
                    // @ts-ignore
                    resolve(null);
                }
            };

            //Finally, open the dialog.
            setGithubAuthOpen(true);
        });
    };

    const clone = async (url: string, curDir: string, folder: string) => {
        const path = Path.join("/" + curDir, folder);
        await mkdirRecursive(path);

        //Clone the repository.
        const result = await Clone(url, path, auth);

        //Display a message.
        if(result instanceof Error) {
            toast.error(result.name + ": " + result.message);
            console.error(result);
        } else {
            toast.success("Successfully cloned repository!");
        }

        refresh();
        resetAll();
    };

    const ensureAccountDetails = async (gitDir: string) : Promise<boolean> => {
        return new Promise<boolean>(async (resolve, reject) => {
            //If the user is setup, we don't have to request their details.
            if(await IsUserSetup(gitDir)) return resolve(true);

            //First, resolve the current function.
            githubDetailsReturn.current(null);
            //Next, create a new function that will resolve the promise when called.
            githubDetailsReturn.current = async (val: [string, string] | null) => {
                //Close the dialog when it is submitted.
                setGithubDetailsOpen(false);

                if(val) {
                    //If a value was provided, save it and return true.
                    await SetupUser(gitDir, val[0], val[1]);
                    resolve(true);
                } else {
                    //Otherwise, return false.
                    // @ts-ignore
                    resolve(false);
                }
            };

            //Finally, open the dialog.
            setGithubDetailsOpen(true);
        });
    };

    const githubOptions = {
        items: [
            {
                text: "Github",
                icon: "download",
                items: [
                    {
                        text: "Clone",
                        type: "clone"
                    },
                    {
                        text: "Commit",
                        type: "commit"
                    },
                    {
                        text: "Pull",
                        type: "pull"
                    },
                ],
            },
        ],
        onItemClick: onGithubClick,
    };

    const onFileUpload = async (e: FileUploadedEvent) => {
        const path = "/" + (e.parentDirectory.path || "");
        await mkdirRecursive(path);

        const reader = new FileReader();
        reader.onload = async () => {
            if(reader.result == null) return;

            const file = Path.join(path, e.fileData.name);

            if(typeof(reader.result) === "string") {
                await writeFile(file, reader.result);
            } else {
                const buffer = new Buffer(reader.result);
                await writeFile(file, buffer);
            }

            refresh();
            resetFile(file);
        };
        reader.readAsArrayBuffer(e.fileData)
    };

    const onRename = async (e: ItemRenamedEvent) => {
        // @ts-ignore
        const path = "/" + (e.sourceItem.parentPath || "");

        const oldFile = Path.join(path, e.sourceItem.name);
        const newFile = Path.join(path, e.itemName);

        //We do this to ensure that the directory (and its parents) exists before we move it, as directories aren't created on the filesystem until they are used.
        if(e.sourceItem.isDirectory) {
            await mkdirRecursive(oldFile);
        } else {
            await mkdirRecursive(path);
        }

        await rename(oldFile, newFile);

        refresh();
        resetFile(oldFile);
    };

    const onMove = async (e: ItemMovedEvent) => {
        // @ts-ignore
        const path = "/" + (e.sourceItem.parentPath || "");

        //We do this to ensure that the directory (and its parents) exists before we move it, as directories aren't created on the filesystem until they are used.
        if(e.sourceItem.isDirectory) {
            await mkdirRecursive(e.sourceItem.path);
        } else {
            await mkdirRecursive(path);
        }

        await rename(e.sourceItem.path, e.itemPath);

        refresh();
        resetFile(e.sourceItem.path);
    };

    const onMkdir = async (e: DirectoryCreatedEvent) => {
        // @ts-ignore
        const path = "/" + (e.parentDirectory.path || "") + "/" + e.name;

        //Create the directory.
        await mkdirRecursive(path);

        refresh();
    };

    const onDelete = async (e: ItemDeletedEvent) => {
        // @ts-ignore
        const path = "/" + (e.item.parentPath || "");

        //We do this to ensure that the directory (and its parents) exists before we move it, as directories aren't created on the filesystem until they are used.
        if(e.item.isDirectory) {
            await mkdirRecursive(e.item.path);

            await rmdirRecursive(e.item.path);

            refresh();
            resetAll();
        } else {
            await mkdirRecursive(path);

            await unlink(e.item.path);

            refresh();
            resetFile(e.item.path);
        }
    };

    const onOpen = (e: SelectedFileOpenedEvent) => {
        //Only allow opening certain file types.
        if(!["", ".lm", ".txt", ".gitignore", ".md"].includes(Path.extname(e.file.name))) return;

        setFile(Path.resolve(e.file.path));
    };

    return (
        <>
            <FileManager fileSystemProvider={fsData || []} height="100%" permissions={{
                //TODO: Fix copy
                copy: false,
                create: true,
                //TODO: Fix downloads
                download: false,
                move: true,
                rename: true,
                upload: true,
                delete: true
            }} ref={fileManagerRef} onFileUploaded={onFileUpload} onItemRenamed={onRename} onItemMoved={onMove} onItemDeleted={onDelete} onSelectedFileOpened={onOpen} onDirectoryCreated={onMkdir}>
                <Toolbar>
                    <Item name="showNavPane" visible="true" />
                    <Item name="separator" />
                    <Item name="create" />
                    <Item widget="dxMenu" location="before" options={newFileMenuOptions} />
                    <Item widget="dxMenu" location="before" options={githubOptions} />
                    <Item name="refresh" />
                    <Item name="separator" location="after" />
                    <Item name="switchView" />

                    <FileSelectionItem name="rename" />
                    <FileSelectionItem name="separator" />
                    <FileSelectionItem name="delete" />
                    <FileSelectionItem name="separator" />
                    <FileSelectionItem name="refresh" />
                    <FileSelectionItem name="clearSelection" />
                </Toolbar>
            </FileManager>
            <GithubClone open={githubCloneOpen} submit={githubCloneReturn.current}/>
            <GithubAuth open={githubAuthOpen} submit={githubAuthReturn.current}/>
            <GithubCommit open={githubCommitOpen} submit={githubCommitReturn.current}/>
            <GithubDetails open={githubDetailsOpen} submit={githubDetailsReturn.current}/>
        </>
    );
};

export default Files;