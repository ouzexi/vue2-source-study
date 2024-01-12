// 判断是原生标签还是自定义组件
const isReservedTag = (tag) => {
    return ['a', 'div', 'p', 'button', 'ul', 'li', 'span'].includes(tag)
}

// _h() _c() 传入实例 标签名 标签属性 子节点
export function createElementVNode(vm, tag, data, ...children) {
    if(data == null) data = {};
    let key = data.key;
    if(key) {
        delete data.key;
    }
    // 如果是原生标签直接创建虚拟节点 否则创建组件虚拟节点
    if(isReservedTag(tag)) {
        return vnode(vm, tag, key, data, children);
    } else {
        // 获取对应的组件定义 可能为Sub类 也可能为选项对象（components: { {template: 'xxxx'} }）
        let Ctor = vm.$options.components[tag];
        return createComponentVnode(vm, tag, key, data, children, Ctor);
    }
}

function createComponentVnode(vm, tag, key, data, children, Ctor) {
    if(typeof Ctor === 'object') {
        // Vue.options默认有_base字段保存Vue全局构造函数
        // 可以借用它的extend静态方法生成Sub构造函数
        Ctor = vm.$options._base.extend(Ctor);
    }
    // 给组件虚拟节点的props添加一个hook属性
    data.hook = {
        // 创建真实节点时 如果是组件则调用此init方法创建
        // 保存组件的实例到虚拟节点上
        init(vnode) {
            let instance = vnode.componentInstance = new vnode.componentOptions.Ctor;
            instance.$mount();
        }
    }
    return vnode(vm, tag, key, data, children, null, { Ctor })
}

export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
}

// ast是语法层面的转化 描述的是语法本身 可以描述js css html
// 虚拟dom描述的是dom元素 可以为dom增加一些自定义属性
function vnode(vm, tag, key, data, children, text, componentOptions) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text,
        componentOptions    // 如果是自定义组件不是原生标签，则componentOptions存有组件的构造函数
    }
}

export function isSameVNode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
}