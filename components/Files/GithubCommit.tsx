import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";
import {useRef, useState} from "react";

const GithubCommit = ({open, submit}: {open: boolean, submit: (message: string | null) => void}) => {
    const [message, setMessage] = useState("");

    return (
        <Dialog open={open} onClose={() => submit(null)}>
            <DialogTitle>Commit</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter the commit message.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    label="Message"
                    type="text"
                    fullWidth
                    variant="standard"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => submit(null)}>Cancel</Button>
                <Button onClick={() => submit(message || null)}>Commit</Button>
            </DialogActions>
        </Dialog>
    );
}

export default GithubCommit;