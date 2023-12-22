import { initMixin } from "./init";

// Vue构造函数
function Vue(options) {
    this._init(options)
}

initMixin(Vue); // 扩展了init方法

export default Vue;