const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
// 匹配到的分组是一个 标签名  <xxx 匹配到的是开始 标签的名字
const startTagOpen = new RegExp(`^<${qnameCapture}`);
// 匹配到的是</xxxx>  最终匹配到的分组就是结束标签的名字
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
// 匹配属性 第一个分组就是属性的key value 就是 分组3/分组4/分组5
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
// 开始标签的结束位置 <div attrs='xxx'> <br/>
const startTagClose = /^\s*(\/?)>/;

// vue3采用的不是正则
// 对模板进行编译处理
export function parseHTML(html) {
    const ELEMENT_TYPE = 1;
    const TEXT_TYPE = 3;
    // 存放元素的栈
    const stack = [];
    // 指向栈中最后一个元素
    let currentParent;
    // 根节点
    let root;

    // 最终需要转化成一颗抽象语法树
    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        };
    }

    function start(tag, attrs) {
        // 创建一个ast节点
        let node = createASTElement(tag, attrs);
        // 如果为空树，则当前节点为树的根节点
        if(!root) {
            root = node;
        }
        // 当前节点的父节点为栈中最后一个节点
        if(currentParent) {
            // 设置当前节点的父节点
            node.parent = currentParent;
            // 同时设置当前节点的父节点的子节点为自身
            currentParent.children.push(node);
        }
        stack.push(node);
        // currentParent指向栈中最后一个
        currentParent = node;
    }

    function chars(text) {
        text = text.replace(/\s/g, '');
        // 文本直接作为当前指向的节点的子元素
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        });
    }

    function end(tag) {
        // 弹出最后一个（检验标签是否合法-待完成）
        // 此时该节点包括它的子节点的ast树已构造完毕
        let node = stack.pop();
        // 指向该节点的父元素 继续构造
        currentParent = stack[stack.length - 1];
    }

    function advance(n) {
        html = html.substring(n);
    }

    function parseStartTag() {
        const start = html.match(startTagOpen);
        if(start) {
            const match = {
                // match第一个分组是标签名
                tagName: start[1],
                attrs: []
            }
            // 匹配到的字符舍弃 继续前进遍历html模板
            advance(start[0].length);

            // 如果不是开始标签的结束位置 就一直匹配 获取属性<div attr='xxx' />
            let attr, end;
            while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length);
                match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] });
            }
            // 前进到结束闭合 > 符号，说明这一个标签上部分已经匹配完 如<div attr='x'>已匹配完 </div>未匹配
            if(end) {
                advance(end[0].length);
            }
            return match;
        }
        // 否则不是开始标签
        return false;
    }

    // html最开始肯定是一个<
    while(html) {
        // 如果textEnd为0 则说明是个开始或者自闭合结束标签 <div> / <div />
        // 如果textEnd > 0 则说明是文本的结束位置 </div>
        let textEnd = html.indexOf('<');
        if(textEnd === 0) {
            // 开始标签的匹配结果
            const startTagMatch = parseStartTag();
            if(startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue;
            }
            // 结束标签的匹配结果
            const endTagMatch = html.match(endTag)
            if(endTagMatch) {
                advance(endTagMatch[0].length);
                end(endTagMatch[1]);
                continue;
            }
        }
        if(textEnd > 0) {
            // console.log(html)
            // 文本内容
            let text = html.substring(0, textEnd);
            if(text) {
                chars(text);
                // 解析完文本后继续前进
                advance(text.length)
            }
        }
    }
    return root;
}