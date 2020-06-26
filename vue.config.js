const path = require("path");
module.exports = {
    outputDir: path.resolve(__dirname, '../application-gateway/static'),
    devServer: {
        proxy: {
            '/': {
                target: 'http://localhost:8000/',
                ws: false,
            }
        }
    },
    configureWebpack: {
        devtool: 'source-map',
        plugins: [],
    }
};
