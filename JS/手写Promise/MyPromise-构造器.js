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
}

const p = new MyPromise((resolve, reject) => {
  throw 123
})
console.log(p)

// 总结
// promise 接受一个 执行器函数
// new Promise((resolve, reject) => {})
// 执行函数中有 2个参数 resolve reject
// Promise 有三种状态 pending rejected fulfilled
// 状态只能从 pending => rejected/fulfillled

// resolve 就是把状态修改为 fulfilled
// reject 就是把状态修改为 rejected
