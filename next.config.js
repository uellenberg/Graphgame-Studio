const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const webpack = require("webpack")

module.exports = withPWA({
    pwa: {
        dest: 'public',
        runtimeCaching,
    },
    plugins: [
        new NodePolyfillPlugin(),
    ],
    webpack(config) {
        config.resolve.alias['fs'] = 'browserfs/dist/shims/fs.js'

        return config
    },
})