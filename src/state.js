import Dep from './observe/dep.js';
import { observe } from './observe/index'
import Watcher from './observe/watcher.js';

export function initState(vm) {
    const opts = vm.$options; // 获取所有的选项
    if(opts.data) {
        initData(vm);
    }
    if(opts.computed) {
        initComputed(vm);
    }
    if(opts.watch) {
        initWatch(vm);
    }
}


function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key];
        },
        set(newValue) {
            vm[target][key] = newValue;
        }
    })
}

function initData(vm) {
    let data = vm.$options.data;
    // data可能是函数或者对象
    data = typeof data === 'function' ? data.call(vm) : data;
    
    // 将返回的对象放到了vue实例的_data属性上
    vm._data = data
    // 对数据进行劫持，vue采用了defineProperty
    observe(data)

    // 将vm._data用vm代理就无须通过vm._data.xxx获取，而是vm.xxx直接获取
    for(let key in data) {
        proxy(vm, '_data', key);
    }
}

function initComputed(vm) {
    const computed = vm.$options.computed;
    // 将计算属性watcher保存到vm上
    const watchers = vm._computedWatchers = {};
    for(let key in computed) {
        let userDef = computed[key];
        // 获取计算属性中get
        let fn = typeof userDef === 'function' ? userDef : userDef.get;

        // 每个计算属性创建一个计算属性watcher lasy: true表示默认不会执行计算属性的get方法（有缓存功能）
        watchers[key] = new Watcher(vm, fn, { lazy: true });
        
        defineComputed(vm, key, userDef);
    }
}
function defineComputed(target, key, userDef) {
    const setter = userDef.set || (() => {});
    // 通过实例获取对应的属性
    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
    })
}

// 计算属性不会收集依赖，只会让自己的依赖属性去收集依赖（即计算属性watcher中的deps中的每个dep会depend这个计算属性所在的渲染watcher）
function createComputedGetter(key) {
    // 判断是否需要执行getter
    return function() {
        // 获取该计算属性对应的watcher
        const watcher = this._computedWatchers[key];
        if(watcher.dirty) {
            // 如果是脏的就执行
            // 执行后dirty不脏了，下次就不会执行
            watcher.evaluate();
        }
        // 计算属性执行后出栈 此时Dep.target为渲染watcher 需要让计算属性中所依赖的属性也去收集该渲染watcher
        // 否则依赖的属性的subs中没有渲染watcher，修改它们时不会更新视图
        // 如fullName = firstName + lastName 这时firstName和lastName属于fullName计算属性watcher中的deps中收集的dep，他们2个会收集渲染watcher
        if(Dep.target) {
            watcher.depend();
        }
        return watcher.value;
    }
}

function initWatch(vm) {
    const watch = vm.$options.watch;
    for(let key in watch) {
        // 可能是字符串 数组 函数
        const handler = watch[key];
        if(Array.isArray(handler)) {
            for(let i = 0; i < handler.length; i++) {
                createWatcher(vm, key, handler[i]);
            }
        } else {
            createWatcher(vm, key, handler);
        }
    }
}

function createWatcher(vm, key, handler) {
    // 字符串 或 函数
    if(typeof handler === 'string') {
        // 从methods中获取
        handler = vm[handler];
    }
    return vm.$watch(key, handler);
}