// _h() _c() 传入实例 标签名 标签属性 子节点
export function createElementVNode(vm, tag, data, ...children) {
    if(data == null) data = {};
    let key = data.key;
    if(key) {
        delete data.key;
    }
    return vnode(vm, tag, key, data, children);
}

export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
}

// ast是语法层面的转化 描述的是语法本身 可以描述js css html
// 虚拟dom描述的是dom元素 可以为dom增加一些自定义属性
function vnode(vm, tag, key, data, children, text) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text
    }
}

export function isSameVNode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
}