import { newArrayProto } from "./array";

class Observer {
    // Object.defineProperty只能劫持已经存在的属性（vue里面会为此单独写一些api $set $delete）
    constructor(data) {
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

export function defineReactive(target, key, value) {
    // 属性的属性也可能是对象，需要递归劫持
    observe(value);
    // 这里的value相当于全局的闭包，let value = null
    Object.defineProperty(target, key, {
        get() {
            console.log('获取值')
            return value
        },
        set(newVal) {
            console.log('设置值')
            // 如果设置的新值是对象的话，也要进行劫持后再赋值
            observe(newVal)
            if(newVal === value) return
            value = newVal
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