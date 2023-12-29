// 一个视图（组件）对应一个watcher

import Dep from "./dep";

/* 
    1）当创建渲染watcher时会把当前渲染的watcher对象赋值到Dep.target上
    2）调用_render会取值 走到get上
    每个属性有一个dep（属性就是被观察者），watcher就是观察者（属性变化后会通知观察者更新） --- 观察者模式
*/

let id = 0;
class Watcher {
    constructor(vm, fn, options) {
        this.id = id++;
        // 表示是一个渲染watcher
        this.renderWatcher = options;
        // 表示调用这个函数可以发生取值操作
        this.getter = fn;
        // 实现计算属性和进行一些清理工作需要用到
        this.deps = [];
        // 每个属性的dep对应一个depId，避免重复收集
        this.depsId = new Set();
        this.get();
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

    get() {
        // 将收集器的目标设置为当前视图
        Dep.target = this;
        // 调用getter即vm._update(vm._render)会调用render方法生成虚拟dom
        // render方法会在vm上取值如vm.name vm.age
        // 此时触发属性的dep收集依赖
        this.getter();
        // render渲染完毕后重置
        Dep.target = null;
    }

    update() {
        console.log('update...')
        // 当前视图多个属性多次改变时，update会触发多次
        // 把当前的watcher暂存起来 实现批量刷新 这样update无论触发多少次 视图更新只调用一次
        queueWatcher(this);
    }

    run() {
        // 渲染时使用最新的vm来渲染
        // 比如vm.name = 20; vm = name = 12; name多次赋值后，取的是最后一次
        this.get();
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