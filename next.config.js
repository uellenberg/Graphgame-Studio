const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = withPWA({
    pwa: {
        dest: 'public',
        runtimeCaching,
    },
    plugins: [
        new NodePolyfillPlugin(),
    ],
})