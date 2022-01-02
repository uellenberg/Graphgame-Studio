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
        config.resolve.alias['buffer'] = 'browserfs/dist/shims/buffer.js'
        config.resolve.alias['path'] = 'browserfs/dist/shims/path.js'
        config.resolve.alias['processGlobal'] = 'browserfs/dist/shims/process.js'
        config.resolve.alias['bufferGlobal'] = 'browserfs/dist/shims/bufferGlobal.js'
        config.resolve.alias['bfsGlobal'] = require.resolve('browserfs')

        config.module.noParse = /browserfs\.js/

        config.plugins.push(new webpack.ProvidePlugin({ BrowserFS: 'bfsGlobal', process: 'processGlobal', Buffer: 'bufferGlobal' }))

        config.optimization.splitChunks = {
            chunks: 'async',
            minSize: 20000,
            minRemainingSize: 0,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            cacheGroups: {
                defaultVendors: false,
                default: false,
                framework: {
                    chunks: 'all',
                    name: 'framework',
                    test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
                    priority: 40,
                    enforce: true,
                },
                commons: {
                    name: 'commons',
                    chunks: 'initial',
                    minChunks: 20,
                    priority: 20,
                },
            },
        }

        return config
    },
})