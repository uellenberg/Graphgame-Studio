import Head from "next/head";

import "../styles/index.scss";
import "prismjs/themes/prism-dark.css";
import 'react-toastify/dist/ReactToastify.css';

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
                <meta name="description" content="An IDE for Graphgame, a game engine for writing games and animations in Desmos." />
                <meta name="keywords" content="graph,game,graphgame,desmos,game,engine,logimat" />
                <title>Graphgame Studio</title>

                <link rel="manifest" href="/manifest.json" />
                <link
                    href="/favicon.ico"
                    rel="shortcut icon"
                    type="image/x-icon"
                />
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
                <link rel="apple-touch-icon" href="/icons/icon-180x180.png"/>
                <meta name="theme-color" content="#181717" />
            </Head>
            <ThemeProvider theme={theme}>
                <Component {...pageProps} />
            </ThemeProvider>
        </>
    );
}

export default App;