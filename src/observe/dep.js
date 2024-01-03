// 每个属性对应一个id
// 一个属性对象多个watcher（视图） 因为一个属性可以在多个组件存在
let id = 0;
class Dep {
    constructor() {
        // 属性的dep要收集watcher
        this.id = id++;
        // 存放当前属性对应的watcher有哪些
        this.subs = [];
    }

    // dep和watcher是多对多关系
    // 一个属性可以在多个组件中使用 - 一个dep对应多个watcher
    // 一个组件存在多个属性 - 一个watcher对应多个dep
    // 所以建立双向关系 dep调用depend时当前watcher（组件/视图）会把这个dep存起来
    // 同时这个dep会调用addSub把当前watcher也存起来
    depend() {
        Dep.target.addDep(this);
    }

    addSub(watcher) {
        this.subs.push(watcher);
    }

    // 属性修改时，会通知使用到这个属性的视图进行更新操作
    notify() {
        this.subs.forEach(watcher => watcher.update());
    }
}

Dep.target = null;
// 用一个栈维护多个watcher（包括计算属性watcher、渲染watcher）
let stack = [];

export function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
}

export function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
}

export default Dep;