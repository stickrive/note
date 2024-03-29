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

  #run() {
    if (this.#state === PENDING) {
      return
    }
    for (let i = 0, len = this.#handlers.length; i < len; i++) {
      const { onFulfilled, onRejected, resolve, reject } = this.#handlers[i]
      if (this.#state === FULFILLED) {
        if (typeof onFulfilled === "function") {
          onFulfilled(this.#result)
        }
      } else if (this.#state === REJECTED) {
        if (typeof onRejected === "function") {
          onRejected(this.#result)
        }
      }
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
  // resolve(1)
  // reject(2)
  // 如果是异步的
  setTimeout(() => {
    resolve(1)
  }, 1000)
})
console.log(p)

p.then(
  (res) => {
    console.log("Promise 完成", res)
  },
  (err) => {
    console.log("Promise 失败", err)
  }
)
p.then(
  (res) => {
    console.log("Promise1 完成", res)
  },
  (err) => {
    console.log("Promise1 失败", err)
  }
)

// 总结 异步 resolve
// then方法
// then方法中 收集 hanlders = [{onFulfilled onRejected rejected resolve}]
// 新增run方法
// 遍历 hanlders
// 根据state 执行 onFulfilled、onRejected
