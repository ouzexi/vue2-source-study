import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom/index";
import { patch } from "./vdom/patch";

export function initLifeCycle(Vue) {
    Vue.prototype._update = function(vnode) {
        const vm = this;
        const el = vm.$el;
        // patch既有初始化的功能 又有更新的功能
        // vm.$el = patch(el, vnode);
    }

    // _c('div', {}, ...children)
    Vue.prototype._c = function() {
        return createElementVNode(this, ...arguments);
    }

    // _v(text)
    Vue.prototype._v = function() {
        return createTextVNode(this, ...arguments);
    }

    Vue.prototype._s = function(value) {
        if(typeof value !== 'object') return value;
        return JSON.stringify(value);
    }

    Vue.prototype._render = function() {
        // 当渲染时会去实例中取值，可以将属性和视图绑定
        const vm = this;
        // 执行render方法，生成虚拟DOM
        return vm.$options.render.call(this);
    }
}

export function mountComponent(vm, el) {
    // $el为querySelector获取的真实DOM
    vm.$el = el;
    // 1、调用render方法生成虚拟节点 虚拟DOM
    const updateComponent = () => {
        vm._update(vm._render());
    }
    const watcher = new Watcher(vm, updateComponent, true);
    // 2、根据虚拟DOM生成真实DOM
    // 3、插入到el元素中
}

// vue核心 
// 1）创造了响应式数据
// 2）模板转换成ast语法树
// 3）将ast语法树转换成render函数
// 4）后续每次更新可以只执行render函数（无需再执行ast转化的过程）

export function callHook(vm, hook) {
    // 此时vm.$options是全局选项和实例选项合并的结果
    // 所以包含mixin的钩子形成一个队列{create: [fn0, fn1, fn2]}
    const handlers = vm.$options[hook];
    if(handlers) {
        handlers.forEach(handler => handler.call(vm));
    }
}