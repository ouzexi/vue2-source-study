// 保留数组的原型
let oldArrayProto = Array.prototype;
// 以数组的原型作为原型创建新的原型对象（newArrayProto.__proto__ = oldArrayProto），
// 这样重写的方法只会存在newArrayProto上，不会污染oldArrayProto
export let newArrayProto = Object.create(oldArrayProto);

// 需重写的7个变异方法
const methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
methods.forEach(method => {
    // 重写的方法挂载到newArrayProto上
    newArrayProto[method] = function(...args) {
        // 内部调用原来的方法，面向切片编程
        // 如 arr.push(1, 2, 3)，this为arr，args为[1, 2, 3]
        const result = oldArrayProto[method].call(this, ...args);

        // 获取数组新增的数据
        let inserted;
        let ob = this.__ob__;
        switch(method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                // 如新增元素时，只需获取第2个下标后的数据：arr.splice(0, 1, {a: 1}, {b: 2})
                inserted = args.slice(2);
                break;
            default:
                break;
        }

        // 对新增的数据再次进行劫持
        if(inserted) {
            ob.observeArray(inserted);
        }

        return result;
    }
})