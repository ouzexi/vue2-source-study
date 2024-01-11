import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue) {
    // 静态方法（Vue.mixin）/属性（Vue.options）
    Vue.options = {};
    Vue.mixin = function(mixin) {
        // 将用户传入的选项和全局选项合并
        // 因为Vue.mixin，所以这里的this是Vue，this.options找到全局选项Vue.options
        this.options = mergeOptions(this.options, mixin);
        return this;
    }
}