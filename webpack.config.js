const webpack = require('webpack');
const path = require('path');
const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
    entry: {
        'nucleon': './src/main.js',
        'nucleon.min': './src/main.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'app',
        libraryTarget: 'var'
    },
    devServer: {
        contentBase: [
            path.join(__dirname, "dist"),
            path.join(__dirname, "examples"),
        ],
        host: '0.0.0.0',
        port: 80,
        disableHostCheck: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
                options: {
                    configFile: './.eslintrc.json'
                }
            }
        ]
    },
    optimization: {
        minimize: false
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({ options: {} }),
        new MinifyPlugin({}, {
            test: /\.min\.js($|\?)/i
        })
    ]
};
