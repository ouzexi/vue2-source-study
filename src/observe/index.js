class Observer {
    // Object.defineProperty只能劫持已经存在的属性（vue里面会为此单独写一些api $set $delete）
    constructor(data) {
        this.walk(data);
    }

    walk(data) {    // 循环对象，对属性依次劫持
        // 重新定义属性
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]));
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
    return new Observer(data)
}