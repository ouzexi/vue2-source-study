// 一个视图（组件）对应一个watcher

import Dep, { popTarget, pushTarget } from "./dep";

/* 
    1）当创建渲染watcher时会把当前渲染的watcher对象赋值到Dep.target上
    2）调用_render会取值 走到get上
    每个属性有一个dep（属性就是被观察者），watcher就是观察者（属性变化后会通知观察者更新） --- 观察者模式
*/

let id = 0;
class Watcher {
    constructor(vm, exprOrFn, options, cb) {
        this.id = id++;
        // 表示是一个渲染watcher
        this.renderWatcher = options;

        // getter表示调用这个函数可以发生取值操作
        // watch可以传入字符串 取methods中的函数
        if(typeof exprOrFn === 'string') {
            this.getter = function() { return vm[exprOrFn]; }
        } else {
            this.getter = exprOrFn;
        }

        // 实现计算属性和进行一些清理工作需要用到
        this.deps = [];
        // 每个属性的dep对应一个depId，避免重复收集
        this.depsId = new Set();
        this.vm = vm;
        // 计算属性watcher传入的缓存标记
        this.lazy = options.lazy;
        this.dirty = this.lazy;
        this.cb = cb;
        this.user = options.user;
        // 如果是计算属性watcher 创建实例时不会自动触发
        this.value = this.lazy ? undefined : this.get();
    }

    addDep(dep) {
        // 一个组件对应多个属性 重复的属性不用记录 比如 <div>{{name}} {{age}} {{name}} {{name}}</div>
        let id = dep.id;
        if(!this.depsId.has(id)) {
            this.deps.push(dep);
            this.depsId.add(id);
            // watcher已经记住dep并且去重了，此时让dep也记住watcher
            dep.addSub(this);
        }
    }

    // 计算属性执行getter得到计算属性的值
    evaluate() {
        // 获取到getter的返回值 同时标识数据不脏了
        this.value = this.get();
        this.dirty = false;
    }

    get() {
        // 将收集器的目标设置为当前视图
        pushTarget(this);
        // 调用getter即vm._update(vm._render)会调用render方法生成虚拟dom
        // render方法会在vm上取值如vm.name vm.age
        // 此时触发属性的dep收集依赖
        let value = this.getter.call(this.vm);
        // render渲染完毕后重置
        popTarget();
        return value;
    }

    // 让计算属性watcher中deps中的每个依赖属性dep去收集当前计算属性所在的渲染watcher
    depend() {
        let i = this.deps.length;
        while(i--) {
            this.deps[i].depend();
        }
    }

    update() {
        console.log('update...', this)
        if(this.lazy) {
            // 如果是计算属性watcher 依赖的值变化 就标识计算属性为脏值
            this.dirty = true;
        } else {
            // 当前视图多个属性多次改变时，update会触发多次
            // 把当前的watcher暂存起来 实现批量刷新 这样update无论触发多少次 视图更新只调用一次
            queueWatcher(this);
        }
    }

    run() {
        // 保存上一次的旧值 给watch使用
        let oldValue = this.value;
        // 渲染时使用最新的vm来渲染
        // 比如vm.name = 20; vm = name = 12; name多次赋值后，取的是最后一次
        let newValue = this.get();
        // 如果是watch的watcher触发 则调用回调
        if(this.user) {
            this.cb.call(this.vm, newValue, oldValue);
        }
    }
}

// 记录需要更新的watcher（视图/组件）
let queue = [];
// 记录当前视图是否已存在于更新队列 去重
let has = {};
// 防抖
let pending = false;
function flushSchedulerQueue() {
    let flushQueue = queue.slice(0);
    // 重置
    queue = [];
    has = {};
    pending = false;
    // 在执行的过程中可能还有新的watcher 重新放到queue中
    flushQueue.forEach(q => q.run());
}
function queueWatcher(watcher) {
    const id = watcher.id;
    if(!has[id]) {
        queue.push(watcher);
        has[id] = true;
        // 批量执行更新 不管update执行多少次 最终只执行一轮刷新操作（是第一次开启的）
        if(!pending) {
            nextTick(flushSchedulerQueue);
            pending = true;
        }
    }
}

// nextTick收集的回调函数队列
let callbacks = [];
// 只在第一次触发nextTick开启 就能保证只开启一次异步操作 队列执行完后重置
let waiting = false;
// 批量执行
function flushCallbacks() {
    let cbs = callbacks.slice(0);
    // 重置
    waiting = false;
    callbacks = [];
    cbs.forEach(cb => cb());
}

// nextTick采用优雅降级的方式
let timerFunc;
if(Promise) {
    timerFunc = () => {
        Promise.resolve().then(flushCallbacks);
    }
} else if(MutationObserver) {
    // 传入的回调函数是异步执行的
    let observer = new MutationObserver(flushCallbacks);
    let textNode = document.createTextNode(1);
    observer.observe(textNode, {
        characterData: true
    });
    timerFunc = () => {
        // 元素变化会执行MutationObserver回调
        textNode.textContent = 2;
    }
} else if(setImmediate) {
    timerFunc = () => {
        setImmediate(flushCallbacks);
    }
} else {
    timerFunc = () => {
        setTimeout(flushCallbacks);
    }
}

// 批量执行，一般是用一个waiting变量控制，第一次触发开启一个异步事件，之后收集全部函数，同步代码执行完后，最后异步批量执行
// 注意：nextTick不是异步的，他只是收集回调队列，开启异步执行队列
export function nextTick(cb) {
    callbacks.push(cb);
    if(!waiting) {
        timerFunc();
        waiting = true;
    }
}

export default Watcher;