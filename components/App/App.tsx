import React from "react";
import {Box, Grid} from "@mui/material";
import Display from "../Display/Display";

const App = () => {
  return (
    <>
      <Box display={{base: "inherit", md: "none"}} height="100%">
        Graphgame Studio requires a larger display to function.
      </Box>
      <Box display={{base: "none", md: "inherit"}} height="100%">
          <Grid container height="100%">
              <Grid item md={8}>
                  <Box height="60%">
                      <Display/>
                  </Box>
                  <Box height="40%">

                  </Box>
              </Grid>
              <Grid item md={4}>

              </Grid>
          </Grid>
      </Box>
    </>
  );
}

export default App;