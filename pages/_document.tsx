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
                    <script src="https://www.desmos.com/api/v1.9/calculator.js?apiKey=1030b80b9dcd49bfbec8bbd40b383837"/>
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