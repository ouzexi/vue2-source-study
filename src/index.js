import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { nextTick } from "./observe/watcher";

// Vue构造函数
function Vue(options) {
    this._init(options)
}

initMixin(Vue); // 扩展了init方法
initLifeCycle(Vue);
Vue.prototype.$nextTick = nextTick;

export default Vue;