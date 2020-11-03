const uploadSourcemaps = require("./upload")
class ErrorMonitorWebpackPlugin {
    constructor(options) {
        this.options = options
    }

    apply(compiler) {
        compiler.hooks.done.tap('ErrorMonitorWebpackPlugin', compilation => {
            console.log(">>>>>>>>>>>run error-monitor-webpack-plugin<<<<<<<<<<")
            const {url, context, dir} = this.options
            // console.log(url, path)
            uploadSourcemaps(url, context, dir)
        })
    }
}

module.exports = ErrorMonitorWebpackPlugin