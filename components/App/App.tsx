import React from "react";
import {Box} from "@mui/material";

function App() {
  return (
    <>
      <Box display={{base: "initial", md: "none"}}>
        Graphgame Studio requires a larger display to function.
      </Box>
      <Box width={{base: "none", md: "initial"}}>

      </Box>
    </>
  );
}

export default App;
