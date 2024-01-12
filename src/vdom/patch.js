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

function createComponent(vnode) {
    let i = vnode.data;
    // 只有自定义组件的props上有hook属性而且hook对象里存在init方法 而原生的props没有
    // 调用hook.init方法生成Sub实例并挂载
    if((i = i.hook) && (i = i.init)) {
        i(vnode);
    }
    // 只有自定义组件的vnode才会在调用hook.init时添加componentInstance属性，并且它的值为对应的Sub实例
    // 所以如果vnode有componentInstance属性则为组件
    if(vnode.componentInstance) {
        return true;
    }
}

export function createElm(vnode) {
    let { tag, data, children, text } = vnode;
    // 标签元素
    if(typeof tag === 'string') {
        // 先判断是组件还是原生元素
        // 是组件则返回对应的真实节点
        if(createComponent(vnode)) {
            return vnode.componentInstance.$el;
        }

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
    // 如果是自定义组件第一次生成时 那么它调用vnode.hook.init方法的$mount方法挂载时 不会传入需要挂载的父节点
    // 返回自定义组件对应的渲染结果
    if(!oldVNode) {
        return createElm(vnode);
    }

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
    // 比对标签的属性
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

    // 将老节点的子节点做映射表
    function makeIndexByKey(children) {
        let map = {};
        children.forEach((child, index) => {
            map[child.key] = index;
        });
        return map;
    }

    let map = makeIndexByKey(oldChildren);

    // 思考 循环为什么要加key
    // 新老节点双方有一方头指针大于尾指针则停止循环
    while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        // 因为可能被标记过 设置为undefined 需要跳过
        if(!oldStartVnode) {
            oldStartVnode = oldChildren[++oldStartIndex];
        }
        // 因为可能被标记过 
        else if(!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex];
        }
        // 头头比对
        else if(isSameVNode(oldStartVnode, newStartVnode)) {
            patchVnode(oldStartVnode, newStartVnode);
            oldStartVnode = oldChildren[++oldStartIndex];
            newStartVnode = newChildren[++newStartIndex];
        }
        // 尾尾比对
        else if(isSameVNode(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode);
            oldEndVnode = oldChildren[--oldEndIndex];
            newEndVnode = newChildren[--newEndIndex];
        }
        // 尾头比对
        else if(isSameVNode(oldEndVnode, newStartVnode)) {
            patchVnode(oldEndVnode, newStartVnode);
            // 新的头节点 与 老的尾节点 相同，复用老节点 移到头部 
            el.insertBefore(oldEndVnode.el, oldStartVnode.el);
            oldEndVnode = oldChildren[--oldEndIndex];
            newStartVnode = newChildren[++newStartIndex];
        }
        // 头尾比对
        else if(isSameVNode(oldStartVnode, newEndVnode)) {
            patchVnode(oldStartVnode, newEndVnode);
            // 新的尾节点 与 老的头节点 相同，复用老节点 移到尾部
            el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
        }
        // 乱序比对
        // 在给动态列表添加key的时候 要尽量避免使用索引 因为索引前后都是从0开始 会发生错误复用
        // 根据老的节点列表做一个映射关系 用新节点去遍历寻找 若找到则移动至头部（因为新节点从头部遍历） 找不到则添加 最后多余的老节点则删除
        else {
            let moveIndex = map[newStartVnode.key];
            // 在老节点映射表中找到对应虚拟节点 则复用
            if(moveIndex !== undefined) {
                let moveVnode = oldChildren[moveIndex];
                el.insertBefore(moveVnode.el, oldStartVnode.el);
                // 表示该节点已做移动处理 不能再比较复用
                oldChildren[moveIndex] = undefined;
                patchVnode(moveVnode, newStartVnode);
            }
            // 找不到则添加至头部
            else {
                el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
            }
            // 当前新节点处理完毕 到下一个
            newStartVnode = newChildren[++newStartIndex];
        }
    }
    // 老节点列表遍历完毕 新节点列表还未遍历完毕 则把多余的新节点插入
    if(newStartIndex <= newEndIndex) {
        for(let i = newStartIndex; i <= newEndIndex; i++) {
            let childEl = createElm(newChildren[i]);
            // 这里可能向后追加 也可能是向前追加（尾尾比对的情况）
            // 判断方法是 新节点列表end下标后是否有下一个节点 有则头插 无则尾插 
            // 所以使用insertBefore代替appendChild 它第二个参数为null时相当于appendChild
            let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null;
            el.insertBefore(childEl, anchor);
        }
    }
    // 新节点列表遍历完毕 老节点列表还未遍历完毕 则把多余的老节点删除
    if(oldStartIndex <= oldEndIndex) {
        for(let i = oldStartIndex; i <= oldEndIndex; i++) {
            // 未被做移动处理的老节点才删除
            if(oldChildren[i]) {
                let childEl = oldChildren[i].el;
                el.removeChild(childEl);
            }
        }
    }
}