(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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
          console.log(html);
          // 文本内容
          var text = html.substring(0, textEnd);
          if (text) {
            chars(text);
            // 解析完文本后继续前进
            advance(text.length);
          }
        }
      }
      console.log(root);
      return root;
    }

    // 对模板进行编译处理
    function compileToFunction(template) {
      // 1、将template转化成ast语法树
      parseHTML(template);
      // 2、生成render方法（render方法执行后的返回的结果就是虚拟DOM）
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
        return result;
      };
    });

    var Observer = /*#__PURE__*/function () {
      // Object.defineProperty只能劫持已经存在的属性（vue里面会为此单独写一些api $set $delete）
      function Observer(data) {
        _classCallCheck(this, Observer);
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
    }();
    function defineReactive(target, key, value) {
      // 属性的属性也可能是对象，需要递归劫持
      observe(value);
      // 这里的value相当于全局的闭包，let value = null
      Object.defineProperty(target, key, {
        get: function get() {
          console.log('获取值');
          return value;
        },
        set: function set(newVal) {
          console.log('设置值');
          // 如果设置的新值是对象的话，也要进行劫持后再赋值
          observe(newVal);
          if (newVal === value) return;
          value = newVal;
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

        // script标签引用的vue.global.js 这个编译过程是在浏览器运行的
        // runtime 和 runtimeWithCompiler的区别就是多了一个compileToFunction步骤
        // 所以runtime是不包含模板编译的 整个编译是打包通过vue-loader转义.vue文件
        // 所以使用vue.runtime.js不能编译选项的template属性
      };
    }
    function initState(vm) {
      var opts = vm.$options; // 获取所有的选项
      if (opts.data) {
        initData(vm);
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

    // Vue构造函数
    function Vue(options) {
      this._init(options);
    }
    initMixin(Vue); // 扩展了init方法

    return Vue;

}));
//# sourceMappingURL=vue.js.map
