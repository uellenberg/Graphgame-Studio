import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";
import {useRef, useState} from "react";

const GithubAuth = ({open, submit}: {open: boolean, submit: (token: string | null) => void}) => {
    const [token, setToken] = useState("");

    return (
        <Dialog open={open} onClose={() => submit(null)}>
            <DialogTitle>Authenticate</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter a Github Authentication Token with access to the repository you are attempting to access. A token can be created <a href="https://github.com/settings/tokens">here</a>. Please note that this token will be stored on the browser in plain-text, and will be accessible to the site and any browser extensions.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    label="Authentication token"
                    type="text"
                    fullWidth
                    variant="standard"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => submit(null)}>Cancel</Button>
                <Button onClick={() => submit(token || null)}>Submit</Button>
            </DialogActions>
        </Dialog>
    );
}

export default GithubAuth;