const {defineConfig} = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
  configureWebpack: {
    resolve: {
      fallback: {
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/')
      }
    }
  },
  // 配置 devServer
  devServer: {
    host: "0.0.0.0",
    port: 8989,
    open: false,
    client: {
      overlay: false,
    },
    proxy: {
      "/zlm": {
        target: 'http://localhost:8088',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        pathRewrite: {
          "^/zlm": "", // 重写请求路径别名
        }
      },
    },
  },
});
