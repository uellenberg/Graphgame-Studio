const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')
const { FilerWebpackPlugin } = require('filer/webpack')

module.exports = withPWA({
    pwa: {
        dest: 'public',
        runtimeCaching,
    },
    plugins: [
        new FilerWebpackPlugin(),
    ],
})