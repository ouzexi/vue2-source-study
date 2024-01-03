(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : String(i);
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  // 匹配到的分组是一个 标签名  <xxx 匹配到的是开始 标签的名字
  var startTagOpen = new RegExp("^<".concat(qnameCapture));
  // 匹配到的是</xxxx>  最终匹配到的分组就是结束标签的名字
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
  // 匹配属性 第一个分组就是属性的key value 就是 分组3/分组4/分组5
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  // 开始标签的结束位置 <div attrs='xxx'> <br/>
  var startTagClose = /^\s*(\/?)>/;

  // vue3采用的不是正则
  // 对模板进行编译处理
  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    // 存放元素的栈
    var stack = [];
    // 指向栈中最后一个元素
    var currentParent;
    // 根节点
    var root;

    // 最终需要转化成一颗抽象语法树
    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }
    function start(tag, attrs) {
      // 创建一个ast节点
      var node = createASTElement(tag, attrs);
      // 如果为空树，则当前节点为树的根节点
      if (!root) {
        root = node;
      }
      // 当前节点的父节点为栈中最后一个节点
      if (currentParent) {
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
        text: text,
        parent: currentParent
      });
    }
    function end(tag) {
      // 弹出最后一个（检验标签是否合法-待完成）
      // 此时该节点包括它的子节点的ast树已构造完毕
      stack.pop();
      // 指向该节点的父元素 继续构造
      currentParent = stack[stack.length - 1];
    }
    function advance(n) {
      html = html.substring(n);
    }
    function parseStartTag() {
      var start = html.match(startTagOpen);
      if (start) {
        var match = {
          // match第一个分组是标签名
          tagName: start[1],
          attrs: []
        };
        // 匹配到的字符舍弃 继续前进遍历html模板
        advance(start[0].length);

        // 如果不是开始标签的结束位置 就一直匹配 获取属性<div attr='xxx' />
        var attr, _end;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }
        // 前进到结束闭合 > 符号，说明这一个标签上部分已经匹配完 如<div attr='x'>已匹配完 </div>未匹配
        if (_end) {
          advance(_end[0].length);
        }
        return match;
      }
      // 否则不是开始标签
      return false;
    }

    // html最开始肯定是一个<
    while (html) {
      // 如果textEnd为0 则说明是个开始或者自闭合结束标签 <div> / <div />
      // 如果textEnd > 0 则说明是文本的结束位置 </div>
      var textEnd = html.indexOf('<');
      if (textEnd === 0) {
        // 开始标签的匹配结果
        var startTagMatch = parseStartTag();
        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        // 结束标签的匹配结果
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }
      if (textEnd > 0) {
        // console.log(html)
        // 文本内容
        var text = html.substring(0, textEnd);
        if (text) {
          chars(text);
          // 解析完文本后继续前进
          advance(text.length);
        }
      }
    }
    return root;
  }

  function genProps(attrs) {
    // {name: value}
    var str = '';
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === 'style') {
        // color: red; background: red; => { color: 'red', background: 'red' }
        var obj = {};
        // qs库也可以实现
        attr.value.split(';').forEach(function (item) {
          var _item$split = item.split(':'),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          obj[key] = value;
        });
        attr.value = obj;
      }
      // id: 'app', style: '{color: 'red'}, '
      str += "".concat(attr.name, ": ").concat(JSON.stringify(attr.value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    // 删除最后一个逗号 {id: 'app', style: '{color: 'red'}}
    return "{".concat(str.slice(0, -1), "}");
  }

  // {{ name }} 匹配到的内容就是表达式的变量
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  function gen(node) {
    // 元素节点
    if (node.type === 1) {
      return codegen(node);
    } else {
      // 文本节点
      var text = node.text;
      if (!defaultTagRE.test(text)) {
        // 普通文本 返回_v('str')
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        // 变量 返回 _v(_s(name) + 'hello' + _s(age))
        // 存放字符的数组[{{name}}, 'hello', {{age}}]
        var tokens = [];
        // 每次匹配到的字符
        var match;
        // 如果 regexp.exec 匹配成功，lastIndex会被设置为紧随最近一次成功匹配的下一个位置，所以每次匹配要重置为0
        defaultTagRE.lastIndex = 0;
        // 最后一次匹配成功的下标
        var lastIndex = 0;
        while (match = defaultTagRE.exec(text)) {
          // {{name}} hello {{age}} hello 
          // 匹配到的下标
          var index = match.index;
          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          // match[0] -> {{name}} / match[1] -> name
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }
        // 匹配完后，还可能存在普通字符
        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }
  function genChildren(children) {
    return children ? children.map(function (child) {
      return gen(child);
    }).join(',') : '';
  }
  function codegen(ast) {
    var children = genChildren(ast.children);
    // console.log("🚀 ~ file: index.js:73 ~ codegen ~ children:", children)
    // _c('div', {id: 'app'}, _v(_s(name) + 'hello'))
    var code = "_c('".concat(ast.tag, "', ").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ", ".concat(children) : '', ")");
    return code;
  }

  // 对模板进行编译处理
  function compileToFunction(template) {
    // 1、将template转化成ast语法树
    var ast = parseHTML(template);
    // 2、生成render方法（render方法执行后的返回的结果就是虚拟DOM）
    var code = codegen(ast);

    // 将this指向当前实例vm 就可以访问当前实例的name、age
    code = "with(this) {return ".concat(code, "}");
    var render = new Function(code);
    // 生成render函数
    return render;
  }

  // 每个属性对应一个id
  // 一个属性对象多个watcher（视图） 因为一个属性可以在多个组件存在
  var id$1 = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      // 属性的dep要收集watcher
      this.id = id$1++;
      // 存放当前属性对应的watcher有哪些
      this.subs = [];
    }

    // dep和watcher是多对多关系
    // 一个属性可以在多个组件中使用 - 一个dep对应多个watcher
    // 一个组件存在多个属性 - 一个watcher对应多个dep
    // 所以建立双向关系 dep调用depend时当前watcher（组件/视图）会把这个dep存起来
    // 同时这个dep会调用addSub把当前watcher也存起来
    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        Dep.target.addDep(this);
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }

      // 属性修改时，会通知使用到这个属性的视图进行更新操作
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);
    return Dep;
  }();
  Dep.target = null;
  // 用一个栈维护多个watcher（包括计算属性watcher、渲染watcher）
  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  /* 
      1）当创建渲染watcher时会把当前渲染的watcher对象赋值到Dep.target上
      2）调用_render会取值 走到get上
      每个属性有一个dep（属性就是被观察者），watcher就是观察者（属性变化后会通知观察者更新） --- 观察者模式
  */

  var id = 0;
  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, options, cb) {
      _classCallCheck(this, Watcher);
      this.id = id++;
      // 表示是一个渲染watcher
      this.renderWatcher = options;

      // getter表示调用这个函数可以发生取值操作
      // watch可以传入字符串 取methods中的函数
      if (typeof exprOrFn === 'string') {
        this.getter = function () {
          return vm[exprOrFn];
        };
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
    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        // 一个组件对应多个属性 重复的属性不用记录 比如 <div>{{name}} {{age}} {{name}} {{name}}</div>
        var id = dep.id;
        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          // watcher已经记住dep并且去重了，此时让dep也记住watcher
          dep.addSub(this);
        }
      }

      // 计算属性执行getter得到计算属性的值
    }, {
      key: "evaluate",
      value: function evaluate() {
        // 获取到getter的返回值 同时标识数据不脏了
        this.value = this.get();
        this.dirty = false;
      }
    }, {
      key: "get",
      value: function get() {
        // 将收集器的目标设置为当前视图
        pushTarget(this);
        // 调用getter即vm._update(vm._render)会调用render方法生成虚拟dom
        // render方法会在vm上取值如vm.name vm.age
        // 此时触发属性的dep收集依赖
        var value = this.getter.call(this.vm);
        // render渲染完毕后重置
        popTarget();
        return value;
      }

      // 让计算属性watcher中deps中的每个依赖属性dep去收集当前计算属性所在的渲染watcher
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;
        while (i--) {
          this.deps[i].depend();
        }
      }
    }, {
      key: "update",
      value: function update() {
        console.log('update...', this);
        if (this.lazy) {
          // 如果是计算属性watcher 依赖的值变化 就标识计算属性为脏值
          this.dirty = true;
        } else {
          // 当前视图多个属性多次改变时，update会触发多次
          // 把当前的watcher暂存起来 实现批量刷新 这样update无论触发多少次 视图更新只调用一次
          queueWatcher(this);
        }
      }
    }, {
      key: "run",
      value: function run() {
        // 保存上一次的旧值 给watch使用
        var oldValue = this.value;
        // 渲染时使用最新的vm来渲染
        // 比如vm.name = 20; vm = name = 12; name多次赋值后，取的是最后一次
        var newValue = this.get();
        // 如果是watch的watcher触发 则调用回调
        if (this.user) {
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }]);
    return Watcher;
  }(); // 记录需要更新的watcher（视图/组件）
  var queue = [];
  // 记录当前视图是否已存在于更新队列 去重
  var has = {};
  // 防抖
  var pending = false;
  function flushSchedulerQueue() {
    var flushQueue = queue.slice(0);
    // 重置
    queue = [];
    has = {};
    pending = false;
    // 在执行的过程中可能还有新的watcher 重新放到queue中
    flushQueue.forEach(function (q) {
      return q.run();
    });
  }
  function queueWatcher(watcher) {
    var id = watcher.id;
    if (!has[id]) {
      queue.push(watcher);
      has[id] = true;
      // 批量执行更新 不管update执行多少次 最终只执行一轮刷新操作（是第一次开启的）
      if (!pending) {
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }

  // nextTick收集的回调函数队列
  var callbacks = [];
  // 只在第一次触发nextTick开启 就能保证只开启一次异步操作 队列执行完后重置
  var waiting = false;
  // 批量执行
  function flushCallbacks() {
    var cbs = callbacks.slice(0);
    // 重置
    waiting = false;
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    });
  }

  // nextTick采用优雅降级的方式
  var timerFunc;
  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    // 传入的回调函数是异步执行的
    var observer = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(1);
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function timerFunc() {
      // 元素变化会执行MutationObserver回调
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    timerFunc = function timerFunc() {
      setTimeout(flushCallbacks);
    };
  }

  // 批量执行，一般是用一个waiting变量控制，第一次触发开启一个异步事件，之后收集全部函数，同步代码执行完后，最后异步批量执行
  // 注意：nextTick不是异步的，他只是收集回调队列，开启异步执行队列
  function nextTick(cb) {
    callbacks.push(cb);
    if (!waiting) {
      timerFunc();
      waiting = true;
    }
  }

  // _h() _c() 传入实例 标签名 标签属性 子节点
  function createElementVNode(vm, tag, data) {
    if (data == null) data = {};
    var key = data.key;
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    return vnode(vm, tag, key, data, children);
  }
  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  // ast是语法层面的转化 描述的是语法本身 可以描述js css html
  // 虚拟dom描述的是dom元素 可以为dom增加一些自定义属性
  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  function patchProps(el, props) {
    for (var key in props) {
      if (key === 'style') {
        for (var styleName in props['style']) {
          el.style[styleName] = props['style'][styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }
  function createElm(vnode) {
    var tag = vnode.tag,
      data = vnode.data,
      children = vnode.children,
      text = vnode.text;
    // 标签元素
    if (typeof tag === 'string') {
      // vnode增加el属性，将虚拟dom和真实dom对应起来，方便后续修改props属性
      vnode.el = document.createElement(tag);
      patchProps(vnode.el, data);
      children.forEach(function (child) {
        var childElm = createElm(child);
        vnode.el.appendChild(childElm);
      });
    } else {
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }

  // 初始化的时候，oldVNode是真实dom 更新时是上一次虚拟DOM
  function patch(oldVNode, vnode) {
    // nodeType是dom元素原生属性
    var isRealElement = oldVNode.nodeType;
    if (isRealElement) {
      // 获取真实dom
      var elm = oldVNode;
      // 获取父元素
      var parentElm = elm.parentNode;
      // 根据虚拟dom创建真实dom
      var newElm = createElm(vnode);
      // 插入到原节点的相邻节点
      parentElm.insertBefore(newElm, elm.nextSibling);
      // 移除原节点
      parentElm.removeChild(elm);
      return newElm;
    }
  }
  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this;
      var el = vm.$el;
      // patch既有初始化的功能 又有更新的功能
      vm.$el = patch(el, vnode);
    };

    // _c('div', {}, ...children)
    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    // _v(text)
    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._s = function (value) {
      if (_typeof(value) !== 'object') return value;
      return JSON.stringify(value);
    };
    Vue.prototype._render = function () {
      // 当渲染时会去实例中取值，可以将属性和视图绑定
      var vm = this;
      // 执行render方法，生成虚拟DOM
      return vm.$options.render.call(this);
    };
  }
  function mountComponent(vm, el) {
    // $el为querySelector获取的真实DOM
    vm.$el = el;
    // 1、调用render方法生成虚拟节点 虚拟DOM
    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };
    new Watcher(vm, updateComponent, true);
    // 2、根据虚拟DOM生成真实DOM
    // 3、插入到el元素中
  }

  // vue核心 
  // 1）创造了响应式数据
  // 2）模板转换成ast语法树
  // 3）将ast语法树转换成render函数
  // 4）后续每次更新可以只执行render函数（无需再执行ast转化的过程）

  // 保留数组的原型
  var oldArrayProto = Array.prototype;
  // 以数组的原型作为原型创建新的原型对象（newArrayProto.__proto__ = oldArrayProto），
  // 这样重写的方法只会存在newArrayProto上，不会污染oldArrayProto
  var newArrayProto = Object.create(oldArrayProto);

  // 需重写的7个变异方法
  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    // 重写的方法挂载到newArrayProto上
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      // 内部调用原来的方法，面向切片编程
      // 如 arr.push(1, 2, 3)，this为arr，args为[1, 2, 3]
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args));

      // 获取数组新增的数据
      var inserted;
      var ob = this.__ob__;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'splice':
          // 如新增元素时，只需获取第2个下标后的数据：arr.splice(0, 1, {a: 1}, {b: 2})
          inserted = args.slice(2);
          break;
      }

      // 对新增的数据再次进行劫持
      if (inserted) {
        ob.observeArray(inserted);
      }

      // 数组本身变化 通知对应的watcher更新视图
      ob.dep.notify();
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    // Object.defineProperty只能劫持已经存在的属性（vue里面会为此单独写一些api $set $delete）
    function Observer(data) {
      _classCallCheck(this, Observer);
      // 给每个对象（对象包括数组）增加收集功能 这样当实例的属性为数组/对象时，对应的数组/对象也会收集依赖
      // 比如vm.arr = [1, 2, 3]，此时vm.arr = [4, 5]会触发视图更新，但是vm.arr.push(6)不会触发更新
      // 因为vm.arr对应的这个数组本身没有收集依赖，所以现在要加上dep收集依赖，在调用7个变异方法后调用notify通知视图更新
      // 同样地，vm.obj = {a: 1} -> vm.obj.b = 2 obj对应的对象本身也需要收集依赖，但是新增b属性时不会触发更新
      // 因为没有调用notify通知更新，可以使用$set更新
      this.dep = new Dep();

      // 需要给对象添加一个__ob__属性，赋值为this，有2个作用
      // 1、数组对新增的数据再次进行劫持，需要调用this的observeArray方法
      // 2、如果一个对象存在Observer类型的__ob__属性，说明被劫持过了，就不需要再被劫持了
      // 另外，需要设置__ob__属性为不可枚举，否则遍历到__ob__属性为一个对象，会被调用observe方法劫持，又给它本身挂载一个__ob__属性，死循环。
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      });
      if (Array.isArray(data)) {
        // 数组项一旦多了，每个项都劫持对性能不好，所以重写数组中7个变异方法，是可以修改数组本身

        // 需要保留数组原有的特性，并且重写部分方法
        data.__proto__ = newArrayProto;
        // 如果数组中存在属性是对象，可以监听到对象的变化
        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }
    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // 循环对象，对属性依次劫持
        // 重新定义属性
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);
    return Observer;
  }(); // 对象的属性或数组的项也可能是对象/数组，深层次嵌套递归使对象/数组本身收集依赖，使其改变时可以调用notify更新视图
  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();
      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }
  function defineReactive(target, key, value) {
    // 属性的属性也可能是对象，需要递归劫持
    var childOb = observe(value);
    // 这里的value相当于全局的闭包，let value = null

    // 每个属性都有一个Dep对象
    var dep = new Dep();
    Object.defineProperty(target, key, {
      get: function get() {
        if (Dep.target) {
          // 让这个属性的收集器dep记住当前的watcher
          // 同时当前的watcher会记住这个属性的收集器
          dep.depend();
          // 同样地，属性的属性如果是对象/数组的话，本身也要实现依赖收集
          if (childOb) {
            childOb.dep.depend();
            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }
        return value;
      },
      set: function set(newVal) {
        if (newVal === value) return;
        // 如果设置的新值是对象的话，也要进行劫持后再赋值
        observe(newVal);
        value = newVal;

        // 属性变化，通知视图更新
        dep.notify();
      }
    });
  }
  function observe(data) {
    // 只对对象进行劫持
    if (_typeof(data) !== 'object' || data == null) {
      return;
    }

    // 如果一个对象被劫持过了，就不需要再被劫持了（要判断一个对象是否被劫持过，可以增添一个实例，用实例判断是否被劫持过）
    if (data.__ob__ instanceof Observer) {
      return data.__ob__;
    }
    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options; // 获取所有的选项
    if (opts.data) {
      initData(vm);
    }
    if (opts.computed) {
      initComputed(vm);
    }
    if (opts.watch) {
      initWatch(vm);
    }
  }
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data;
    // data可能是函数或者对象
    data = typeof data === 'function' ? data.call(vm) : data;

    // 将返回的对象放到了vue实例的_data属性上
    vm._data = data;
    // 对数据进行劫持，vue采用了defineProperty
    observe(data);

    // 将vm._data用vm代理就无须通过vm._data.xxx获取，而是vm.xxx直接获取
    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }
  function initComputed(vm) {
    var computed = vm.$options.computed;
    // 将计算属性watcher保存到vm上
    var watchers = vm._computedWatchers = {};
    for (var key in computed) {
      var userDef = computed[key];
      // 获取计算属性中get
      var fn = typeof userDef === 'function' ? userDef : userDef.get;

      // 每个计算属性创建一个计算属性watcher lasy: true表示默认不会执行计算属性的get方法（有缓存功能）
      watchers[key] = new Watcher(vm, fn, {
        lazy: true
      });
      defineComputed(vm, key, userDef);
    }
  }
  function defineComputed(target, key, userDef) {
    var setter = userDef.set || function () {};
    // 通过实例获取对应的属性
    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  }

  // 计算属性不会收集依赖，只会让自己的依赖属性去收集依赖（即计算属性watcher中的deps中的每个dep会depend这个计算属性所在的渲染watcher）
  function createComputedGetter(key) {
    // 判断是否需要执行getter
    return function () {
      // 获取该计算属性对应的watcher
      var watcher = this._computedWatchers[key];
      if (watcher.dirty) {
        // 如果是脏的就执行
        // 执行后dirty不脏了，下次就不会执行
        watcher.evaluate();
      }
      // 计算属性执行后出栈 此时Dep.target为渲染watcher 需要让计算属性中所依赖的属性也去收集该渲染watcher
      // 否则依赖的属性的subs中没有渲染watcher，修改它们时不会更新视图
      // 如fullName = firstName + lastName 这时firstName和lastName属于fullName计算属性watcher中的deps中收集的dep，他们2个会收集渲染watcher
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    };
  }
  function initWatch(vm) {
    var watch = vm.$options.watch;
    for (var key in watch) {
      // 可能是字符串 数组 函数
      var handler = watch[key];
      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }
  function createWatcher(vm, key, handler) {
    // 字符串 或 函数
    if (typeof handler === 'string') {
      // 从methods中获取
      handler = vm[handler];
    }
    return vm.$watch(key, handler);
  }

  function initMixin(Vue) {
    // 给Vue增加init方法
    Vue.prototype._init = function (options) {
      // 用于初始化操作
      // vm.$options 就是获取用户的配置$nextTick $data $attr ...
      var vm = this;
      vm.$options = options;

      // 初始化状态
      initState(vm);

      // 实现数据挂载到元素
      if (options.el) {
        vm.$mount(options.el);
      }
    };
    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;
      // 先查找有无render函数
      if (!ops.render) {
        // 没有render函数，查找有无template
        var template;
        // 没有template模板，但是有el元素
        if (!ops.template && el) {
          template = el.outerHTML;
        } else {
          // 有template模板，使用template模板
          if (el) {
            template = ops.template;
          }
        }
        // 获取到template 需要对模板进行编译
        if (template) {
          var render = compileToFunction(template);
          // 模板编译后转化成render函数 挂载到实例上
          ops.render = render;
        }
      }
      // 组件的挂载，将vm实例挂载到el上
      mountComponent(vm, el);

      // script标签引用的vue.global.js 这个编译过程是在浏览器运行的
      // runtime 和 runtimeWithCompiler的区别就是多了一个compileToFunction步骤
      // 所以runtime是不包含模板编译的 整个编译是打包通过vue-loader转义.vue文件
      // 所以使用vue.runtime.js不能编译选项的template属性
    };
  }

  // Vue构造函数
  function Vue(options) {
    this._init(options);
  }

  // 扩展了init方法
  initMixin(Vue);
  initLifeCycle(Vue);
  Vue.prototype.$nextTick = nextTick;

  // watch多种形式最终都是调用这个方法
  Vue.prototype.$watch = function (exprOrFn, cb) {
    // firstname / () => vm.firstname
    // firstname的值变化了 直接执行cb函数即可
    new Watcher(this, exprOrFn, {
      user: true
    }, cb);
  };

  return Vue;

}));
//# sourceMappingURL=vue.js.map
