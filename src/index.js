import { compileToFunction } from "./compiler/index";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";
import { createElm, patch } from "./vdom/patch";

// Vue构造函数
function Vue(options) {
    this._init(options)
}

 // 扩展了init方法
initMixin(Vue);
initLifeCycle(Vue);
// 实现nextTick $watch
initStateMixin(Vue);

// ------------测试虚拟节点diff算法---------------
let render1 = compileToFunction(`<ul  a="1" style="color:blue">
    <li key="a">a</li>
    <li key="b">b</li>
    <li key="c">c</li>
    <li key="d">d</li>
</ul>`);
let vm1 = new Vue({ data: { name: 'zf' } })
let prevVnode = render1.call(vm1)

let el = createElm(prevVnode);
document.body.appendChild(el)


let render2 = compileToFunction(`<ul  a="1"  style="color:red;">
    <li key="b">b</li>
    <li key="m">m</li>
    <li key="a">a</li>
    <li key="p">p</li>
    <li key="c">c</li>
    <li key="q">q</li>
</ul>`);
let vm2 = new Vue({ data: { name: 'zf' } })
let nextVnode = render2.call(vm2);

setTimeout(() => {
    patch(prevVnode, nextVnode)
}, 1000)

export default Vue;