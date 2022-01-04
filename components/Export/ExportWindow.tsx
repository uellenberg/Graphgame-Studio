import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";
import * as desmos from "../../lib/desmos";

const ExportWindow = ({open, close}: {open: boolean, close: () => void}) => {
    const exportVal = typeof window !== "undefined" && typeof window.Calc !== "undefined" ? ("window.Calc.setState(" + JSON.stringify(window.Calc.getState()) + ")") : "";

    return (
        <Dialog open={open} onClose={close}>
            <DialogTitle>Export Graph</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    In order to export the graph, copy the code below and paste it into console on Desmos (F12 -{">"} Console).
                </DialogContentText>
                <TextField multiline fullWidth variant="filled" rows={4} value={exportVal} onInput={() => {}} />
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExportWindow;