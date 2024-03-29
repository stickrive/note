const PENDING = "pending"
const FULFILLED = "fulfilled"
const REJECTED = "rejected"

class MyPromise {
  #state = PENDING
  #result = undefined
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
    if (this.#state === PENDING) {
      this.#state = state
      this.#result = result
    }
  }

  then(onFulfilled, onRejected) {
    if (this.#state === FULFILLED) {
      onFulfilled(this.#result)
    } else if (this.#state === REJECTED) {
      onRejected(this.#result)
    }
  }
}

const p = new MyPromise((resolve, reject) => {
  // throw 123
  resolve(1)
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

// 总结
// 在then方法
// 接收 成功的回调、失败的回调
// 返回新的Promise
