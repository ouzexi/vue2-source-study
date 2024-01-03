import { compileToFunction } from './compiler/index.js';
import { mountComponent } from './lifecycle.js';
import { initState } from './state.js';

export function initMixin(Vue) { // 给Vue增加init方法
    Vue.prototype._init = function(options) { // 用于初始化操作
        // vm.$options 就是获取用户的配置$nextTick $data $attr ...
        const vm = this;
        
        vm.$options = options;

        // 初始化状态
        initState(vm);

        // 实现数据挂载到元素
        if(options.el) {
            vm.$mount(options.el);
        }
    }

    Vue.prototype.$mount = function(el) {
        const vm = this;
        el = document.querySelector(el);
        let ops = vm.$options;
        // 先查找有无render函数
        if(!ops.render) {
            // 没有render函数，查找有无template
            let template;
            // 没有template模板，但是有el元素
            if(!ops.template && el) {
                template = el.outerHTML;
            } else {
                // 有template模板，使用template模板
                if(el) {
                    template = ops.template;
                }
            }
            // 获取到template 需要对模板进行编译
            if(template) {
                const render = compileToFunction(template);
                // 模板编译后转化成render函数 挂载到实例上
                ops.render = render;
            }
        }
        // 组件的挂载，将vm实例挂载到el上
        mountComponent(vm, el)

        // script标签引用的vue.global.js 这个编译过程是在浏览器运行的
        // runtime 和 runtimeWithCompiler的区别就是多了一个compileToFunction步骤
        // 所以runtime是不包含模板编译的 整个编译是打包通过vue-loader转义.vue文件
        // 所以使用vue.runtime.js不能编译选项的template属性
    }
}