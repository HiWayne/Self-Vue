//仿vue开始

function Vue(option) {
    var _this = this
    this.el = option.el
    this.data = option.data
    //在obj上定义属性key的value
    function def(obj, key, val, enumerable) {
        if (!obj || typeof (obj) !== "object") return
        Object.defineProperty(obj, key, {
            configurable: true,
            enumerable: !!enumerable,
            value: val,
            writable: true
        })
    }
    //观察者模式(订阅发布模式)
    //订阅者
    function Watcher(node, name, vue, sign) {
        Dep.target = this
        this.node = node
        this.name = name
        this.vue = vue
        this.sign = sign
        this.updata()
        Dep.target = null
    }
    Watcher.prototype = {
        updata: function () {
            this.get()
            switch (this.sign) {
                case "v-model":
                    this.node.value = this.value
                case "attr":
                    var reg = /\{\{(.*)\}\}/
                    var attrs = this.node.attributes
                    for (let i in attrs) {
                        if (reg.test(attrs[i].nodeValue)) {
                            var currentName = RegExp.$1
                            if (currentName === this.name) {
                                attrs[i].nodeValue = this.value
                            }
                        }
                    }
                case "text":
                    this.node.nodeValue = this.value
            }
        },
        get: function () {
            this.value = this.vue[this.name]
        }
    }
    //主题对象
    function Dep() {
        this.sub = []
    }
    Dep.prototype = {
        addsub: function (sub) {
            this.sub.push(sub)
        },
        depend: function () {
            if (Dep.target) this.addsub(Dep.target)
        },
        notify: function () {
            this.sub.forEach(function (watcher) {
                watcher.updata()
            })
        }
    }
    Dep.target = null
    //数组变异方法用以监听数组改动
    var newMethods = ["push", "splice", "pop", "shift", "unshift", "sort", "reverse"]
    var ArrayMethod = Object.create(Array.prototype)
    newMethods.forEach(function (value) {
        var TrueMethod = Array.prototype[value]
        def(ArrayMethod, value, function () {
            var arguments$1 = arguments
            var i = arguments.length
            var args = new Array(i)
            while (i--) {
                args[i] = arguments$1[i]
            }
            var result = TrueMethod.apply(this, args)
            var ob = this.__ob__
            var inserted
            switch (value) {
                case 'push':
                    inserted = args
                    break
                case 'unshift':
                    inserted = args
                    break
                case 'splice':
                    inserted = args.slice(2)
                    break
            }
            if (inserted) ob.arrayObserve(inserted)
            ob.dep.notify()
            return result
        }, true)
    })
    //给对象的每个属性设置监听，并对也是对象的属性递归
    function Observe(value) {
        this.value = value
        this.dep = new Dep()
        def(value, "__ob__", this)
        if (Array.isArray(value)) {
            var hasProto = __proto__ in {}
            var augment = hasProto ? protoAugment : copyAugment
            function protoAugment(target, src) {
                target.__proto__ = src
            }
            function copyAugment(target, src, keys) {
                for (let i = 0; i < keys.length; i++) {
                    var key = keys[i]
                    def(target, key, src[key])
                }
            }
            augment(value, ArrayMethod, newMethods)
        }
        else {
            this.walk(value)
        }
        /*var properties = Object.keys(value)
        if (!properties.length) return
        properties.forEach(function (key) {
            if (value[key] instanceof Array) {
                augment(value[key], ArrayMethod, newMethods)
            }
            observeChild(value[key])
            defineReactive(value, key, value[key])
        })*/
    }
    Observe.prototype = {
        walk: function (value) {
            var _this = this
            Object.keys(value).forEach(function (key) {
                _this.defineReactive(value, key, value[key])
            })
        },
        //监听：给对象的属性设置get、set方法
        defineReactive: function (obj, key, val) {
            var dep = new Dep()
            var property = Object.getOwnPropertyDescriptor(obj, key)
            var getter = property && property.get
            var setter = property && property.set
            var childOb = observe(val)
            Object.defineProperty(obj, key, {
                configurable: true,
                enumerable: true,
                get: function () {
                    const value = getter ? getter.call(obj) : val
                    dep.depend()
                    if (childOb) {
                        childOb.dep.depend()
                        if (Array.isArray(value)) {
                            arrayDepend(value)
                        }
                    }
                    return value
                },
                set: function (newVal) {
                    const value = getter ? getter.call(obj) : val
                    if (newVal === value) return
                    if (setter) {
                        setter.call(obj, newVal)
                        return
                    }
                    val = newVal
                    //对新的值也设置监听
                    observe(newVal)
                    //如果新的值是数组，那么注册订阅对象
                    if (Array.isArray(newVal)) newVal.__ob__.dep.sub = dep.sub
                    //向主题对象发布变动信息
                    dep.notify()
                }
            })
            function arrayDepend(value) {
                for (let e, i = 0, l = value.length; i < l; i++) {
                    e = value[i]
                    e && e.__ob__ && e.__ob__.dep.depend()
                    if (Array.isArray(e)) {
                        arrayDepend(e)
                    }
                }
            }
        },
        arrayObserve: function (value) {
            Object.keys(value).forEach(function (key) {
                observe(value[key])
            })
        }
    }
    //判断对象的某个属性是否是可监听
    function observe(value) {
        if (!value || typeof (value) !== "object" || typeof (value) === "function" || value.__ob__) return
        var ob = new Observe(value)
        return ob
    }
    //监听menu对象及其属性对象
    observe(this.data)
    proxy(this.data, this)
    //复制vue.data里的属性到vue中并使用代理模式
    function proxy(data, vue) {
        Object.keys(data).forEach(function (key) {
            Object.defineProperty(vue, key, {
                constructor: true,
                enumerable: false,
                get: function () {
                    return data[key]
                },
                set: function (newVal) {
                    data[key] = newVal
                }
            })
        })
    }
    //创建文档片段
    if (this.el.indexOf("#") !== -1) {
        var id = this.el.substring(1)
        var oldElement = document.getElementById(id)
    }
    var frag = nodeToFragment()
    oldElement.appendChild(frag)
    function nodeToFragment() {
        var fragment = document.createDocumentFragment()
        var child
        while (child = oldElement.firstChild) {
            fragment.appendChild(child)
            compile(child, _this)
        }
        return fragment
    }
    //编译并绑定订阅对象watcher
    function compile(node, vue) {
        var reg = /\{\{(.*)\}\}/
        var reg_attr = /^\s*([^\[\.]+)\s*(\[|\.)\s*([^\[\]\.]+)\]?$/
        if (node.nodeType === 1) {
            var attrs = node.attributes
            for (let i in attrs) {
                if (attrs[i].nodeName === "v-model") {
                    var name = attrs[i].nodeValue
                    var sign = "v-model"
                    if (document.addEventListener) {
                        node.addEventListener("input", function (e) {
                            vue[name] = e.target.value
                        })
                    }
                    else {
                        node.attachEvent("oninput", function (e) {
                            e = window.event
                            vue[name] = e.target.value
                        })
                    }
                    new Watcher(node, name, vue, sign)
                }
                if (reg.test(attrs[i].nodeValue)) {
                    var sign = "attr"
                    var name = RegExp.$1
                    new Watcher(node, name, vue, sign)
                }
            }
        }
        else if (node.nodeType === 3) {
            if (reg.test(node.nodeValue)) {
                var sign = "text"
                var name = RegExp.$1
                name = name.trim()
                new Watcher(node, name, vue, sign)
            }
        }
        if (node.childNodes.length) {
            var childNodes = [].slice.call(node.childNodes)
            for (let i in childNodes) {
                compile(childNodes[i], vue)
            }
        }
    }
}

//仿vue结束
