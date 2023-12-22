export function initMixin(Vue) { // 给Vue增加init方法
    Vue.prototype._init = function(options) { // 用于初始化操作
        // vm.$options 就是获取用户的配置$nextTick $data $attr ...
        const vm = this;
        
        vm.$options = options;

        // 初始化状态
        initState(vm);
    }
}

function initState(vm) {
    const opts = vm.$options; // 获取所有的选项
    if(opts.data) {
        initData(vm);
    }
}

function initData(vm) {
    let data = vm.$options.data;
    // data可能是函数或者对象
    data = typeof data === 'function' ? data.call(vm) : data;
    console.log(data)
}