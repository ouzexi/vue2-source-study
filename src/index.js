import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";

// Vue构造函数
function Vue(options) {
    this._init(options)
}

initMixin(Vue); // 扩展了init方法
initLifeCycle(Vue);

export default Vue;