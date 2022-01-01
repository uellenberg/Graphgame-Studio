import Document, { Html, Head, Main, NextScript } from "next/document";

export default class Doc extends Document {
    static async getInitialProps(ctx: any) {
        const initialProps = await Document.getInitialProps(ctx);
        return { ...initialProps };
    }

    render() {
        return (
            <Html lang="en">
                <Head>
                    <script src="https://www.desmos.com/api/v1.6/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"/>
                    <script src="/browserfs.min.js"/>
                    <link href="https://cdnjs.cloudflare.com/ajax/libs/devextreme/21.2.4/css/dx.dark.css" rel="stylesheet"/>
                </Head>
                <body>
                    <Main/>
                    <NextScript/>
                </body>
            </Html>
        );
    }
}