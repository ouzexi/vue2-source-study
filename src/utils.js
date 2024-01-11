const strats = {};
const LIFECYCLE = ['beforeCreate', 'created'];
LIFECYCLE.forEach(hook => {
    // 比如将组件和mixin的created钩子形成队列 {created: [fn0, fn1, fn2]}
    // 如果mixin（儿子）有 组件（父亲）有 则数组合并
    // 儿子有父亲没有 将儿子包时装成数组
    // 儿子没有 父亲（组件里的created）原封不动即可
    strats[hook] = function(p, c) {
        if(c) {
            if(p) {
                return p.concat(c);
            } else {
                return [c];
            }
        } else {
            return p;
        }
    }
})

export function mergeOptions(parent, child) {
    const options = {};
    for(let key in parent) {
        mergeFields(key);
    }
    for(let key in child) {
        if(!parent.hasOwnProperty(key)) {
            mergeFields(key);
        }
    }

    function mergeFields(key) {
        // 策略模式（如生命周期钩子 要特殊处理 做成队列）
        if(strats[key]) {
            options[key] = strats[key](parent[key], child[key]);
        } else {
            // 合并选项 优先用子选项 没有则父选项
            options[key] = child[key] || parent[key];
        }
    }
    return options;
}