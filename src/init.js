import { observe } from './observe/index'

export function initMixin(Vue) { // 给Vue增加init方法
    Vue.prototype._init = function(options) { // 用于初始化操作
        // vm.$options 就是获取用户的配置$nextTick $data $attr ...
        const vm = this;
        
        vm.$options = options;

        // 初始化状态
        initState(vm);
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