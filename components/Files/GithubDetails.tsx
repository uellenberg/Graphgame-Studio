import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";
import {useState} from "react";

const GithubDetails = ({open, submit}: {open: boolean, submit: (data: [string, string] | null) => void}) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    return (
        <Dialog open={open} onClose={() => submit(null)}>
            <DialogTitle>Details</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter the name and email that you would like to be used in the commit messages.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    label="Name"
                    type="text"
                    fullWidth
                    variant="standard"
                />
                <TextField
                    margin="dense"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    label="Email"
                    type="text"
                    fullWidth
                    variant="standard"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => submit(null)}>Cancel</Button>
                <Button onClick={() => submit([name, email])}>Submit</Button>
            </DialogActions>
        </Dialog>
    );
}

export default GithubDetails;