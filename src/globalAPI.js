import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue) {
    // 静态方法（Vue.mixin）/属性（Vue.options）
    // 默认有一个_base字段保存Vue这样全局构造函数，用来方便后续使用Vue的静态方法如extend等
    Vue.options = {
        _base: Vue
    };
    Vue.mixin = function(mixin) {
        // 将用户传入的选项和全局选项合并
        // 因为Vue.mixin，所以这里的this是Vue，this.options找到全局选项Vue.options
        this.options = mergeOptions(this.options, mixin);
        return this;
    }

    // 手动创建组件进行挂载
    Vue.extend = function(options) {
        // 根据用户的参数 返回一个构造函数
        // 这个构造函数new的实例 就是组件实例 继承了Vue 所以可以调用init方法
        function Sub(options = {}) {
            this._init(options);
        }
        // Sub.prototype.__proto__ === Vue.prototype
        // 用Object.create创建的对象 指定他的原型 要手动改回他的构造函数
        Sub.prototype = Object.create(Vue.prototype);
        Sub.prototype.constructor = Sub;

        // 合并用户传递的参数 和 全局的Vue.options
        Sub.options = mergeOptions(Vue.options, options);
        return Sub;
    }

    // 全局的组件会保存到这里 如 Vue.component('xxx', xxx);
    Vue.options.components = {};

    Vue.component = function(id, definition) {
        // 如果definition已经是函数 说明已调用Vue.extend生成一个组件构造函数 否则需要自己包装
        definition = typeof definition === 'function' ? definition : Vue.extend(definition);
        Vue.options.components[id] = definition;
    }
}