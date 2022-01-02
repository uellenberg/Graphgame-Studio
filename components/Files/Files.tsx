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
    FileUploadedEvent, ItemDeletedEvent,
    ItemDownloadingEvent, ItemMovedEvent,
    ItemRenamedEvent, SelectedFileOpenedEvent,
    ToolbarItemClickEvent
} from "devextreme/ui/file_manager";
import {Clone} from "../../lib/git";
import GithubAuth from "./GithubAuth";
import {GitAuth} from "isomorphic-git";
import GithubClone from "./GithubClone";

const Files = ({setFile}: {setFile: (file: string) => void}) => {
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
        createFile(itemData.extension as string, fileSystemItem).then(val => {
            if(val) {
                setFSData(fsData);
                fileManagerRef.current?.instance.refresh();
            }
        });
    };

    const createFile = async (fileExtension: string, directory = fileManagerRef.current?.instance.getCurrentDirectory()) => {
        if (!directory.isDirectory || !fileExtension) {
            return false;
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
            if(!fsData) return false;
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

        await writeFile(Path.join(path, name), "");
        array.push(newItem);

        return true;
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

    const onCloneRepository = async ({itemData, viewArea, fileSystemItem}: {itemData: any, viewArea: any, fileSystemItem: any}) => {
        const directory = fileManagerRef.current?.instance.getCurrentDirectory();
        if(!directory?.isDirectory) return;


        //First, create a new function that will be called when the data is entered.
        //We don't run the old function here because it doesn't have any outstanding promise to resolve.
        githubCloneReturn.current = (val: [string, string] | null) => {
            //Close the dialog when it is submitted.
            setGithubCloneOpen(false);

            //If no data is returned, don't do anything.
            if(!val) return;

            //Clone the specified repository.
            clone(val[0], directory?.path || "", val[1]);
        };

        //Finally, open the dialog.
        setGithubCloneOpen(true);
    }

    const clone = async (url: string, curDir: string, folder: string) => {
        const path = Path.join("/" + curDir, folder);
        await mkdirRecursive(path);

        Clone(url, path, () => {
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
        }, () => {
            refresh();
        });
    }

    const cloneRepoOptions = {
        items: [
            {
                text: "Clone repository",
                icon: "download",
            },
        ],
        onItemClick: onCloneRepository,
    };

    const onFileUpload = async (e: FileUploadedEvent) => {
        const path = "/" + (e.parentDirectory.path || "");
        await mkdirRecursive(path);

        const reader = new FileReader();
        reader.onload = async () => {
            if(reader.result == null) return;

            if(typeof(reader.result) === "string") {
                await writeFile(Path.join(path, e.fileData.name), reader.result);
            } else {
                const buffer = new Buffer(reader.result);
                await writeFile(Path.join(path, e.fileData.name), buffer);
            }

        };
        reader.readAsArrayBuffer(e.fileData)
    };

    const onRename = async (e: ItemRenamedEvent) => {
        // @ts-ignore
        const path = "/" + (e.sourceItem.parentPath || "");

        //We do this to ensure that the directory (and its parents) exists before we move it, as directories aren't created on the filesystem until they are used.
        if(e.sourceItem.isDirectory) {
            await mkdirRecursive(Path.join(path, e.sourceItem.name));
        } else {
            await mkdirRecursive(path);
        }

        await rename(Path.join(path, e.sourceItem.name), Path.join(path, e.itemName));
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
    };

    const onDelete = async (e: ItemDeletedEvent) => {
        // @ts-ignore
        const path = "/" + (e.item.parentPath || "");

        //We do this to ensure that the directory (and its parents) exists before we move it, as directories aren't created on the filesystem until they are used.
        if(e.item.isDirectory) {
            await mkdirRecursive(e.item.path);

            await rmdirRecursive(e.item.path);
        } else {
            await mkdirRecursive(path);

            await unlink(e.item.path);
        }
    };

    const onOpen = (e: SelectedFileOpenedEvent) => {
        //Only allow opening .lm files.
        if(!["", ".lm", ".txt", ".gitignore"].includes(Path.extname(e.file.name))) return;

        setFile(e.file.path);
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
            }} ref={fileManagerRef} onFileUploaded={onFileUpload} onItemRenamed={onRename} onItemMoved={onMove} onItemDeleted={onDelete} onSelectedFileOpened={onOpen}>
                <Toolbar>
                    <Item name="showNavPane" visible="true" />
                    <Item name="separator" />
                    <Item name="create" />
                    <Item widget="dxMenu" location="before" options={newFileMenuOptions} />
                    <Item widget="dxMenu" location="before" options={cloneRepoOptions} />
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
        </>
    );
};

export default Files;