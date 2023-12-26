import { compileToFunction } from './compiler/index.js';
import { observe } from './observe/index'

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

        // script标签引用的vue.global.js 这个编译过程是在浏览器运行的
        // runtime 和 runtimeWithCompiler的区别就是多了一个compileToFunction步骤
        // 所以runtime是不包含模板编译的 整个编译是打包通过vue-loader转义.vue文件
        // 所以使用vue.runtime.js不能编译选项的template属性
    }
}

export function initState(vm) {
    const opts = vm.$options; // 获取所有的选项
    if(opts.data) {
        initData(vm);
    }
}

function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key];
        },
        set(newValue) {
            vm[target][key] = newValue;
        }
    })
}

function initData(vm) {
    let data = vm.$options.data;
    // data可能是函数或者对象
    data = typeof data === 'function' ? data.call(vm) : data;
    
    // 将返回的对象放到了vue实例的_data属性上
    vm._data = data
    // 对数据进行劫持，vue采用了defineProperty
    observe(data)

    // 将vm._data用vm代理就无须通过vm._data.xxx获取，而是vm.xxx直接获取
    for(let key in data) {
        proxy(vm, '_data', key);
    }
}