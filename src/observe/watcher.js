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
        this.get()
    }
}

export default Watcher;