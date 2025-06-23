// config-overrides.js
const webpack = require('webpack');
const { override } = require('customize-cra'); // 確保這行存在

module.exports = override( // <--- 這裡需要調用 override 函數
    (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            "buffer": require.resolve("buffer/"),
            "stream": require.resolve("stream-browserify"),
            "crypto": require.resolve("crypto-browserify"),
            "assert": require.resolve("assert/"),
            "util": require.resolve("util/"),
            "url": require.resolve("url/"),
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "path": require.resolve("path-browserify"),
        };

        config.plugins = (config.plugins || []).concat([
            new webpack.ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
            }),
        ]);

        return config;
    }
);
