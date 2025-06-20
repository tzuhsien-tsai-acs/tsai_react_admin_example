// config-overrides.js
const webpack = require('webpack');
const { override } = require('customize-cra');

module.exports = override(
    (config) => {
        // 添加 Node.js 核心模組的 fallback
        config.resolve.fallback = {
            ...config.resolve.fallback,
            "buffer": require.resolve("buffer/"), // 提供 Buffer 模組的 Polyfill
            "stream": require.resolve("stream-browserify"), // 提供 Stream 模組的 Polyfill
            // 為了更全面的兼容性，可能還需要以下模組，您可以根據後續錯誤信息逐步添加
            // "assert": require.resolve("assert/"),
            // "util": require.resolve("util/"),
            // "url": require.resolve("url/"),
            // "crypto": require.resolve("crypto-browserify"), // 通常用於加密操作
            // "http": require.resolve("stream-http"),
            // "https": require.resolve("https-browserify"),
            // "os": require.resolve("os-browserify/browser"),
            // "path": require.resolve("path-browserify"),
        };

        // 添加 Webpack ProvidePlugin 來自動引入 process 和 Buffer
        config.plugins = (config.plugins || []).concat([
            new webpack.ProvidePlugin({
                process: 'process/browser', // 為 process 對象提供 Polyfill
                Buffer: ['buffer', 'Buffer'], // 為 Buffer 類提供 Polyfill
            }),
        ]);

        return config;
    }
);
