const PENDING = "pending"
const FULFILLED = "fulfilled"
const REJECTED = "rejected"

class MyPromise {
  #state = PENDING
  #result = undefined
  #handlers = []
  constructor(executor) {
    const resolve = (data) => {
      this.#changeState(FULFILLED, data)
    }
    const reject = (result) => {
      this.#changeState(REJECTED, result)
    }
    // 注意点 executor 执行报错 调用reject
    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  #changeState(state, result) {
    if (this.#state !== PENDING) return
    this.#state = state
    this.#result = result
    this.#run()
  }

  #isPromiseLike(value) {
    // 条件1： value 是函数 或者 对象
    // 条件2： value.then是一个函数
    let res = false
    if (
      typeof value === "function" ||
      (typeof value === "object" && value !== null)
    ) {
      if (value.then && typeof value.then === "function") {
        return true
      }
    }
    return res
  }

  #run() {
    if (this.#state === PENDING) {
      return
    }
    for (let i = 0, len = this.#handlers.length; i < len; i++) {
      const { onFulfilled, onRejected, resolve, reject } = this.#handlers[i]
      // onFulfilled 不是函数 直接透传 结果
      // onFulfilled 是函数
      //  1、 onFulfilled 的返回值 data 为普通值  reslove(data) reject(err)
      //  2、 onFulfilled 的返回值 为 Promise
      //      所以需要判断 返回值是不是满足 Promise A+ 规范
      this.#runMicroTask(() => {
        if (this.#state === FULFILLED) {
          if (typeof onFulfilled === "function") {
            try {
              const data = onFulfilled(this.#result)
              if (this.#isPromiseLike(data)) {
                // 符合Promise A+
                data.then(resolve, reject)
              } else {
                resolve(data)
              }
            } catch (error) {
              reject(error)
            }
          } else {
            resolve(this.#result)
          }
        } else if (this.#state === REJECTED) {
          if (typeof onRejected === "function") {
            try {
              const data = onRejected(this.#result)
              if (this.#isPromiseLike(data)) {
                // 符合Promise A+
                data.then(resolve, reject)
              } else {
                resolve(data)
              }
            } catch (error) {
              reject(error)
            }
          } else {
            reject(this.#result)
          }
        }
      })
    }
  }

  #runMicroTask(func) {
    // setTimeout(func, 0)
    // 模拟微队列环境
    if (typeof MutationObserver === "function") {
      const ob = new MutationObserver(func)
      const textNode = document.createTextNode("1")
      ob.observe(textNode, {
        characterData: true,
      })
      textNode.textContent = "2"
    } else {
      setTimeout(func, 0)
    }
  }

  then(onFulfilled, onRejected) {
    // if (this.#state === FULFILLED) {
    //   onFulfilled(this.#result)
    // } else if (this.#state === REJECTED) {
    //   onRejected(this.#result)
    // }
    const p = new MyPromise((resolve, reject) => {
      // 这个p 中的 resolve，reject 为什么要调用？
      // 因为 Promise可以链式调用 你这个返回了 还可以.then
      // 所以 p 必定执行中会调用 resolve/reject
      // 而且是根据 onFulfilled/onRejected 的值
      this.#handlers.push({
        onFulfilled,
        onRejected,
        resolve,
        reject,
      })
      this.#run()
    })

    return p
  }
}

const p = new MyPromise((resolve, reject) => {
  // throw 123
  resolve(1)
  // reject(2)
  // 如果是异步的
  // setTimeout(() => {
  //   resolve(1)
  //   // reject(2)
  // }, 1000)
})
// console.log(p)

setTimeout(() => {
  console.log(1)
}, 0)

new Promise((resolve) => {
  resolve(2)
}).then((res) => {
  console.log("====res====", res)
})

// p.then(90, (err) => {
//   console.log("Promise 失败", err)
// }).then((res) => {
//   console.log("====res====", res)
// })
// p.then((res) => {
//   console.log("Promise1 完成", res)
// }, 991)

// 总结
// 返回的Promise 的结果是什么
// 判断 onFulfilled\onRejected 类型 如果不是函数 旧直接透传 this.#result
// 是函数 就 用try...catch 执行函数 ，
// 报错就是 reject
// 拿到结果 data, 判断结果是否为promise A+标准
// 不是 就 resolve(data)
// 是的话 执行 data.then(reslove, reject)

// 技术要点
// 1、异步 resolve\reject 怎么处理
//  定义一个 handlers数组， 改变状态的时候 遍历数组，执行对应的方法

// 2、then 方法中的 返回的Promise状态 怎么确认
//  2.1 区分 onFulfilled\onRejected 的类型
//  2.1.1 如果不是函数 直接透传
//  2.1.2 如果是函数 try...catch执行 用 data 接受函数的结果
//  报错 reject
//  判断 data 是否符合 promise A+规范
//  符合的话 data.then(resolve, reject)
//  不符合 直接resolve(data)

// 3、怎么模拟微任务
// 利用 MutationObserver ，自定义一个文本节点，手动更改 触发func
// const ob = new MutationObserver(func)
