import { newArrayProto } from "./array";
import Dep from "./dep";

class Observer {
    // Object.defineProperty只能劫持已经存在的属性（vue里面会为此单独写一些api $set $delete）
    constructor(data) {

        // 给每个对象（对象包括数组）增加收集功能 这样当实例的属性为数组/对象时，对应的数组/对象也会收集依赖
        // 比如vm.arr = [1, 2, 3]，此时vm.arr = [4, 5]会触发视图更新，但是vm.arr.push(6)不会触发更新
        // 因为vm.arr对应的这个数组本身没有收集依赖，所以现在要加上dep收集依赖，在调用7个变异方法后调用notify通知视图更新
        // 同样地，vm.obj = {a: 1} -> vm.obj.b = 2 obj对应的对象本身也需要收集依赖，但是新增b属性时不会触发更新
        // 因为没有调用notify通知更新，可以使用$set更新
        this.dep = new Dep();

        // 需要给对象添加一个__ob__属性，赋值为this，有2个作用
        // 1、数组对新增的数据再次进行劫持，需要调用this的observeArray方法
        // 2、如果一个对象存在Observer类型的__ob__属性，说明被劫持过了，就不需要再被劫持了
        // 另外，需要设置__ob__属性为不可枚举，否则遍历到__ob__属性为一个对象，会被调用observe方法劫持，又给它本身挂载一个__ob__属性，死循环。
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false
        });
        
        if(Array.isArray(data)) {
            // 数组项一旦多了，每个项都劫持对性能不好，所以重写数组中7个变异方法，是可以修改数组本身
            
            // 需要保留数组原有的特性，并且重写部分方法
            data.__proto__ = newArrayProto;
            // 如果数组中存在属性是对象，可以监听到对象的变化
            this.observeArray(data);
        } else {
            this.walk(data);
        }
    }

    walk(data) {    // 循环对象，对属性依次劫持
        // 重新定义属性
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]));
    }

    observeArray(data) {
        data.forEach(item => observe(item))
    }
}

// 对象的属性或数组的项也可能是对象/数组，深层次嵌套递归使对象/数组本身收集依赖，使其改变时可以调用notify更新视图
function dependArray(value) {
    for(let i = 0; i < value.length; i++) {
        let current = value[i];
        current.__ob__ && current.__ob__.dep.depend();
        if(Array.isArray(current)) {
            dependArray(current);
        }
    }
}

export function defineReactive(target, key, value) {
    // 属性的属性也可能是对象，需要递归劫持
    let childOb = observe(value);
    // 这里的value相当于全局的闭包，let value = null

    // 每个属性都有一个Dep对象
    let dep = new Dep();

    Object.defineProperty(target, key, {
        get() {
            if(Dep.target) {
                // 让这个属性的收集器dep记住当前的watcher
                // 同时当前的watcher会记住这个属性的收集器
                dep.depend();
                // 同样地，属性的属性如果是对象/数组的话，本身也要实现依赖收集
                if(childOb) {
                    childOb.dep.depend();
                    if(Array.isArray(value)) {
                        dependArray(value);
                    }
                }
            }
            return value
        },
        set(newVal) {
            if(newVal === value) return
            // 如果设置的新值是对象的话，也要进行劫持后再赋值
            observe(newVal)
            value = newVal

            // 属性变化，通知视图更新
            dep.notify();
        }
    })
}

export function observe(data) {
    // 只对对象进行劫持
    if(typeof data !== 'object' || data == null) {
        return
    }

    // 如果一个对象被劫持过了，就不需要再被劫持了（要判断一个对象是否被劫持过，可以增添一个实例，用实例判断是否被劫持过）
    if(data.__ob__ instanceof Observer) {
        return data.__ob__;
    }
    
    return new Observer(data)
}