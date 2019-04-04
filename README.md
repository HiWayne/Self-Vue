# Self-Vue
<h3>你可以下载代码或者通过<a href="https://hiwayne.github.io/Self-Vue/self-vue.html">点击DEMO</a>查看演示<br /><br />
class实例赋值给了全局变量app，你可以在输入框尝试双向绑定效果，你也可以在控制台修改app的message和title属性或app.data中的message和title属性来尝试数据监听效果（两者之间使用了代理模式）。你可以使用self-vue.js来实现和vue核心一样的事情。
</h3><br />
项目描述：自己实现的vue源码(Self-Realized vue source code)<br />
目前v-model命令，响应式对象、数组，双向绑定已经完成<br />
<h3>基本原理：非数组使用object.defineProperty设置get和set监听，数组在Array原型对象中扩展7种变异方法来监听，双向绑定使用事件监听。其中还需使用正则编译HTML模板，同时大量使用了观察者/订阅发布设计模式，为了能直接在this中操作this.data中的属性，还使用了代理模式等。</h3><br />
目前遇到了数组在html中遍历渲染的问题，需要使用到AST。
