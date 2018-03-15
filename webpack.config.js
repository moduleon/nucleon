const webpack = require('webpack');
const path = require('path');

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
    },
    module: {
        loaders: [
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
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true,
            comments: false,
        })
    ]
};
