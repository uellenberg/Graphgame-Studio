import {Button} from "@mui/material";

const Compile = ({disabled, compile}: {disabled: boolean, compile: () => void}) => {
    return (
        <Button variant="contained" disabled={disabled} onClick={() => compile()} style={{margin: "auto"}}>
            Compile
        </Button>
    );
};

export default Compile;