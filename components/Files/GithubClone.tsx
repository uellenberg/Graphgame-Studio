import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";
import {useState} from "react";

const GithubClone = ({open, submit}: {open: boolean, submit: (data: [string, string] | null) => void}) => {
    const [url, setURL] = useState("");
    const [path, setPath] = useState("");

    return (
        <Dialog open={open} onClose={() => submit(null)}>
            <DialogTitle>Authenticate</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter the URL of the repository, and an optional folder for it to be cloned into. If no folder is specified, it will be cloned in to the current working directory.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    value={url}
                    onChange={e => setURL(e.target.value)}
                    label="URL"
                    type="text"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    margin="dense"
                    value={path}
                    onChange={e => setPath(e.target.value)}
                    label="Directory"
                    type="text"
                    fullWidth
                    variant="standard"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => submit(null)}>Cancel</Button>
                <Button onClick={() => submit([url, path])}>Clone</Button>
            </DialogActions>
        </Dialog>
    );
}

export default GithubClone;