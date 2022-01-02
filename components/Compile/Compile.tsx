import {Button} from "@mui/material";

const Compile = ({compile}: {compile: (force: boolean) => void}) => {
    return (
        <Button variant="contained" onClick={() => compile(true)}>
            Compile
        </Button>
    );
};

export default Compile;