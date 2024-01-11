import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";

// Vue构造函数
function Vue(options) {
    this._init(options)
}

 // 扩展了init方法
initMixin(Vue);
initLifeCycle(Vue);
initGlobalAPI(Vue);
// 实现nextTick $watch
initStateMixin(Vue);

export default Vue;