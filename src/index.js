import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import Watcher, { nextTick } from "./observe/watcher";

// Vue构造函数
function Vue(options) {
    this._init(options)
}

 // 扩展了init方法
initMixin(Vue);
initLifeCycle(Vue);
Vue.prototype.$nextTick = nextTick;

// watch多种形式最终都是调用这个方法
Vue.prototype.$watch = function(exprOrFn, cb) {
    // firstname / () => vm.firstname
    // firstname的值变化了 直接执行cb函数即可
    new Watcher(this, exprOrFn, { user: true }, cb);
}

export default Vue;