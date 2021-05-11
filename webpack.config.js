let path = require('path');

// vue 新版本必要的插件
const VueLoaderPlugin = require('vue-loader/lib/plugin');

// 这个配置文件，起始就是一个js文件，通过 Node 中的模块操作，向外暴露了一个配置对象
module.exports = {

    mode: 'none',

    // 入口，表示，要使用 webpack 打包哪个文件
    entry: path.join(__dirname, 'src/main.js'),

    output: {
        // 输出文件相关的配置

        // 指定打包好的文件，输出到哪个项目中
        path: path.join(__dirname, 'dist'),
        // 这是指定输出文件的名称
        filename: 'bundle.js'
    },

    plugins: [
        // 存放一些必要的插件
        new VueLoaderPlugin()
    ],

    module: {
        // 这个节点用于配置所有第三方模块加载器
        rules: [
            // 所有第三方匹配规则

            // 例如配置处理 .vue 文件的第三方 loader 规则
            {test: /\.vue$/, use: 'vue-loader'}
        ]
    },

    resolve: {
        alias: {
            // 设置 vue 被导入时候的包的路径
            "vue$": "vue/dist/vue.js"
        }
    },
};