import {Button} from "@mui/material";

const Compile = ({disabled, compile}: {disabled: boolean, compile: (force: boolean) => void}) => {
    return (
        <Button variant="contained" disabled={disabled} onClick={() => compile(true)} style={{margin: "auto"}}>
            Compile
        </Button>
    );
};

export default Compile;