import Head from "next/head";

import "../styles/index.scss";
import "prismjs/themes/prism-dark.css";

import "../lib/grammar";
import "../lib/files";
import {createTheme, ThemeProvider} from "@mui/material";

const App = ({Component, pageProps}: {Component: any, pageProps: any}) => {
    const theme = createTheme({
        palette: {
            mode: "dark"
        },
    });

    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta
                    name="viewport"
                    content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
                />
                <meta name="description" content="Description" />
                <meta name="keywords" content="Keywords" />
                <title>Graphgame Studio</title>

                <link rel="manifest" href="/manifest.json" />
                <link
                    href="/icons/favicon-16x16.png"
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                />
                <link
                    href="/icons/favicon-32x32.png"
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                />
                <link rel="apple-touch-icon" href="/apple-icon.png"/>
                <meta name="theme-color" content="#317EFB" />
            </Head>
            <ThemeProvider theme={theme}>
                <Component {...pageProps} />
            </ThemeProvider>
        </>
    );
}

export default App;