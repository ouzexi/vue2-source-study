import { createElementVNode, createTextVNode } from "./vdom/index";

function patchProps(el, props) {
    for(let key in props) {
        if(key === 'style') {
            for(let styleName in props['style']) {
                el.style[styleName] = props['style'][styleName];
            }
        } else {
            el.setAttribute(key, props[key]);
        }
    }
}

function createElm(vnode) {
    let { tag, data, children, text } = vnode;
    // 标签元素
    if(typeof tag === 'string') {
        // vnode增加el属性，将虚拟dom和真实dom对应起来，方便后续修改props属性
        vnode.el = document.createElement(tag);
        patchProps(vnode.el, data);
        children.forEach(child => {
            const childElm = createElm(child);
            vnode.el.appendChild(childElm);
        })
    } else {
        vnode.el = document.createTextNode(text);
    }
    return vnode.el;
}

// 初始化的时候，oldVNode是真实dom 更新时是上一次虚拟DOM
function patch(oldVNode, vnode) {
    // nodeType是dom元素原生属性
    const isRealElement = oldVNode.nodeType;
    if(isRealElement) {
        // 获取真实dom
        const elm = oldVNode;
        // 获取父元素
        const parentElm = elm.parentNode;
        // 根据虚拟dom创建真实dom
        let newElm = createElm(vnode);
        // 插入到原节点的相邻节点
        parentElm.insertBefore(newElm, elm.nextSibling);
        // 移除原节点
        parentElm.removeChild(elm);
    } else {
        // diff算法
    }
}

export function initLifeCycle(Vue) {
    Vue.prototype._update = function(vnode) {
        const vm = this;
        const el = vm.$el;
        // patch既有初始化的功能 又有更新的功能
        vm.$el = patch(el, vnode);
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
    vm._update(vm._render());
    // 2、根据虚拟DOM生成真实DOM
    // 3、插入到el元素中
}

// vue核心 
// 1）创造了响应式数据
// 2）模板转换成ast语法树
// 3）将ast语法树转换成render函数
// 4）后续每次更新可以只执行render函数（无需再执行ast转化的过程）