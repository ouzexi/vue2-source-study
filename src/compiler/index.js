import { parseHTML } from "./parse";

function genProps(attrs) {
    // {name: value}
    let str = '';
    for(let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];
        if(attr.name === 'style') {
            // color: red; background: red; => { color: 'red', background: 'red' }
            let obj = {};
            // qs库也可以实现
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':');
                obj[key] = value;
            });
            attr.value = obj;
        }
        // id: 'app', style: '{color: 'red'}, '
        str += `${attr.name}: ${JSON.stringify(attr.value)},`
    }
    // 删除最后一个逗号 {id: 'app', style: '{color: 'red'}}
    return `{${str.slice(0, -1)}}`;
}

// {{ name }} 匹配到的内容就是表达式的变量
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
function gen(node) {
    // 元素节点
    if(node.type === 1) {
        return codegen(node);
    } else {
        // 文本节点
        let text = node.text;
        if(!defaultTagRE.test(text)) {
            // 普通文本 返回_v('str')
            return `_v(${JSON.stringify(text)})`;
        } else {
            // 变量 返回 _v(_s(name) + 'hello' + _s(age))
            // 存放字符的数组[{{name}}, 'hello', {{age}}]
            let tokens = [];
            // 每次匹配到的字符
            let match;
            // 如果 regexp.exec 匹配成功，lastIndex会被设置为紧随最近一次成功匹配的下一个位置，所以每次匹配要重置为0
            defaultTagRE.lastIndex = 0;
            // 最后一次匹配成功的下标
            let lastIndex = 0;
            while(match = defaultTagRE.exec(text)) {
                // {{name}} hello {{age}} hello 
                // 匹配到的下标
                let index = match.index;
                if(index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)));
                }
                // match[0] -> {{name}} / match[1] -> name
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length;
            }
            // 匹配完后，还可能存在普通字符
            if(lastIndex < text.length) {
                tokens.push(JSON.stringify(text.slice(lastIndex)));
            }
            return `_v(${tokens.join('+')})`;
        }
    }
}

function genChildren(children) {
    return children ? children.map(child => gen(child)).join(',') : '';
}

function codegen(ast) {
    let children = genChildren(ast.children);
    // console.log("🚀 ~ file: index.js:73 ~ codegen ~ children:", children)
    // _c('div', {id: 'app'}, _v(_s(name) + 'hello'))
    let code = (`_c('${ast.tag}', ${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'}${ast.children.length ? `, ${children}` : ''}`);
    return code;
}

// 对模板进行编译处理
export function compileToFunction(template) {
    // 1、将template转化成ast语法树
    let ast = parseHTML(template);
    // 2、生成render方法（render方法执行后的返回的结果就是虚拟DOM）
    let code = codegen(ast);
    // console.log("🚀 ~ file: index.js:85 ~ compileToFunction ~ code:", code)
}