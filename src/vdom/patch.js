import { isSameVNode } from "./index";

function patchProps(el, oldProps = {}, props = {}) {
    // 某个属性 老节点中有 新节点中没有 要删除老的
    let oldStyles = oldProps.style || {};
    let newStyles = props.style || {};
    // 老节点样式中有 新的没有 要把样式去掉
    for(let key in oldStyles) {
        if(!newStyles[key]) {
            el.style[key] = ''
        }
    }

    // 比较其他新老属性
    for(let key in oldProps) {
        if(!props[key]) {
            el.removeAttribute(key);
        }
    }

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

export function createElm(vnode) {
    let { tag, data, children, text } = vnode;
    // 标签元素
    if(typeof tag === 'string') {
        // vnode增加el属性，将虚拟dom和真实dom对应起来，方便后续修改props属性
        vnode.el = document.createElement(tag);
        patchProps(vnode.el, {}, data);
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
export function patch(oldVNode, vnode) {
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

        return newElm;
    } else {
        // diff算法（平级比较）
        // 1、两个节点不是同一个节点 直接删除老的换上新的 （无需对比）
        // 2、两个节点是同一个节点（判断tag和key） 比较两个节点的属性是否有差异（复用老的节点，将差异的属性更新）
        // 3、节点比较完毕后需要比较两个节点的子节点
        return patchVnode(oldVNode, vnode);
    }
}

function patchVnode(oldVNode, vnode) {
    if(!isSameVNode(oldVNode, vnode)) {
        // 新的替换老的
        let el = createElm(vnode);
        oldVNode.el.parentNode.replaceChild(el, oldVNode.el);
        return el;
    }
    // 文本的情况(文本的tag和key都为undefined) 比较文本的内容
    // 复用老节点的元素 无需新创建dom
    let el = vnode.el = oldVNode.el;
    // 都是文本
    if(!oldVNode.tag) {
        if(oldVNode.text !== vnode.text) {
            // 用新的文本覆盖老的文本
            el.textContent = vnode.text;
        }
    }
    // 都是文本 比对标签的属性
    patchProps(el, oldVNode.data, vnode.data);

    // 比较儿子节点 需要考虑 一方有儿子&一方没儿子 或 两方都有儿子
    let oldChildren = oldVNode.children || [];
    let newChildren = vnode.children || [];

    // 两方都有儿子
    if(oldChildren.length > 0 && newChildren.length > 0) {
        updateChildren(el, oldChildren, newChildren);
    }
    // 老节点没有儿子 新节点有 直接插入儿子
    else if(newChildren.length > 0) {
        mountChildren(el, newChildren);
    }
    // 新节点没有儿子 老节点有 直接删除儿子
    else if(oldChildren.length > 0) {
        // 可以循环 removeChild
        el.innerHTML = '';
    }
    return el;
}

function mountChildren(el, newChildren) {
    for(let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i];
        el.appendChild(createElm(child));
    }
}

function updateChildren(el, oldChildren, newChildren) {
    // 双指针比较两个节点 新头-旧头 新尾-旧尾 当头指针超过尾指针时结束
    let oldStartIndex = 0;
    let newStartIndex = 0;
    let oldEndIndex = oldChildren.length - 1;
    let newEndIndex = newChildren.length - 1;

    let oldStartVnode = oldChildren[oldStartIndex];
    let newStartVnode = newChildren[newStartIndex];

    let oldEndVnode = oldChildren[oldEndIndex];
    let newEndVnode = newChildren[newEndIndex];

    console.log(oldStartVnode, newStartVnode, oldEndVnode, newEndVnode);
    while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        break;
    }
}