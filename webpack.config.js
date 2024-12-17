const path = require('path');

module.exports = {
    entry: {
        main: './admin/js/main.js',
        auth: './admin/js/services/auth.js',
        api: './admin/js/services/api.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js']
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            name: 'vendor'
        }
    }
}; 