// config-overrides.js
const webpack = require('webpack');
const { override } = require('customize-cra');

module.exports = override(
    (config) => {
        // 添加 Node.js 核心模組的 fallback
        config.resolve.fallback = {
            ...config.resolve.fallback,
            "buffer": require.resolve("buffer/"),
            "stream": require.resolve("stream-browserify"),
            "crypto": require.resolve("crypto-browserify"), // <-- **新增這行**
            // 這些通常也會被需要，為了穩健性建議也加上
            "assert": require.resolve("assert/"),
            "util": require.resolve("util/"),
            "url": require.resolve("url/"),
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "path": require.resolve("path-browserify"),
        };

        // 添加 Webpack ProvidePlugin 來自動引入 process 和 Buffer
        config.plugins = (config.plugins || []).concat([
            new webpack.ProvidePlugin({
                process: 'process/browser', // <-- **新增這行**
                Buffer: ['buffer', 'Buffer'], // <-- **新增這行**
            }),
        ]);

        return config;
    }
);
