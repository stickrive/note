import foo from "./foo.js"

import("./dynamic.js").then((m) => {
  console.log("main", m.default)
})

console.log("main", foo, bar)

import bar from "./bar.js"

// 1、模块解析 （不运行代码）

//  1.1 补全地址为绝对路径(下载文件)
//   <script src="./main.js" type="module"></script>
//  补全后 <script src="http://127.0.0.1:5501/demo/main.js" type="module"></script>
//  1.2 下载完成后， 拿到顶级（全局作用域块）、静态导入语句 （自动将后面 导入语句 提前
// import foo from "./foo.js" // 执行 1.1 步骤
// import bar from "./bar.js"  // 执行 1.1 步骤
// foo 执行 1.2 步骤
// bar 执行 1.2 步骤

// foo.js
// import bar from "./bar.js" // 在上面的步骤中已经下载

// bar.js
// 无依赖
// 解析结束

// 2、模块执行（运行代码）

// main.js ==> import foo from "./foo.js"
// 进入 foo.js ==> 进入 bar.js

// console.log("bar") // 打印顺序： 1
// export default "bar"
// 导出映射表
// {
//   default: 'bar'
// }

// 返回 foo.js
// import bar from "./bar.js"
// console.log("foo", bar) 打印顺序： 2
// export default "foo"
// 导出映射表
// {
//   default: 'foo'
// }

// 返回 main.js
// import foo from "./foo.js" // 已执行

// 动态导入 是 运行期间处理
// 静态导入 是 解析期间处理
// 动态导入 dynamic.js ==> 异步的，所以先执行后面的代码
// import("./dynamic.js").then((m) => {
//   console.log("main", m.default)
// })

// console.log("main", foo, bar) // 打印顺序： 3

// import bar from "./bar.js" // 已提前执行

// dynamic.js 执行

// import bar from "./bar.js" // 已经下载
// console.log("dynamic", bar) // 打印顺序： 4
// export default "dynamic"
// 导出映射表
// {
//   default: 'dynamic'
// }

// 总结
//
// 1、先下载静态解析模块(子模块中引入的模块同样需要下载)
// 2、从入口开始(main.js)执行，遇到引入模块，先执行最深模块的内容，执行完后，回到上一层继续执行，直到回到入口
// 3、继续执行下一行代码
