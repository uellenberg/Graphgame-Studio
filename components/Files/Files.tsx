import React, {useEffect, useState} from "react";
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

const Files = ({setFile}: {setFile: (file: string) => void}) => {
    const [fs, setFS] = useState<FileTree | null>(null);

    useEffect(() => {
        GetTree().then(val => {
            setFS(val);
            fileManagerRef.current?.instance.refresh();
        });
    }, []);

    const fileManagerRef = React.createRef<FileManager>();

    const onAddClick = ({itemData, viewArea, fileSystemItem}: {itemData: any, viewArea: any, fileSystemItem: any}) => {
        createFile(itemData.extension as string, fileSystemItem).then(val => {
            if(val) {
                setFS(fs);
                fileManagerRef.current?.instance.refresh();
            }
        });
    };

    const createFile = async (fileExtension: string, directory = fileManagerRef.current?.instance.getCurrentDirectory()) => {
        console.log(directory)
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
            if(!fs) return false;
            array = fs;
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
        if(!e.file.name.endsWith(".lm")) return;

        setFile(e.file.path);
    };

    return (
        <FileManager fileSystemProvider={fs || []} height="100%" permissions={{
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
    );
};

export default Files;