import React from "react";
import {Box} from "@mui/material";
import Display from "../Display/Display";

export default function App() {
  return (
    <>
      <Box display={{base: "inherit", md: "none"}} height="100%">
        Graphgame Studio requires a larger display to function.
      </Box>
      <Box display={{base: "none", md: "inherit"}} height="100%">
          <Display/>
      </Box>
    </>
  );
}