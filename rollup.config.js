import babel from 'rollup-plugin-babel'
// rollup默认可以导出一个对象，作为打包的配置文件
export default {
    // 入口
    input: './src/index.js',
    output: {
        // 出口
        file: './dist/vue.js',
        // 在全局添加一个Vue对象 global.Vue
        name: 'Vue',
        // 打包产物规范：esm-es6模块 / commonjs模块 / iife立即执行函数 / umd（兼容commonjs和amd）
        format: 'umd',
        // 方便调试源代码
        sourcemap: true
    },
    plugins: [
        // babel压缩&转换代码排除的文件夹，另外配置项可单独写在.babelrc或babel.config.js
        babel({
            exclude: 'node_modules/**'
        })
    ]
}