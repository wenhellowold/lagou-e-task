/**
 * 一  谈谈你是如何理解JS异步编程的
 * 
 * JS的任务分为两种，一种是同步任务（synchronous），另一种是异步任务（asynchronous）。
 * 同步任务指的是，在主线程上排队执行的任务，只有前一个任务执行完毕，才能执行后一个任务；
 * 异步任务指的是，不进入主线程、而进入"任务队列"（task queue）的任务，
 * 只有等主线程任务执行完毕，"任务队列"开始通知主线程，请求执行任务，该任务才会进入主线程执行。
 * 
 * 异步运行机制如下：

（1）所有同步任务都在主线程上执行，形成一个执行栈（execution context stack）。
（2）主线程之外，还存在一个"任务队列"（task queue）。只要异步任务有了运行结果，就在"任务队列"之中放置一个事件。
（3）一旦"执行栈"中的所有同步任务执行完毕，系统就会读取"任务队列"，看看里面有哪些事件。那些对应的异步任务，
    于是结束等待状态，进入执行栈，开始执行。
（4）主线程不断重复上面的第三步。


Event Loop即事件循环，是指浏览器或Node的一种解决javaScript单线程运行时不会阻塞的一种机制

script全部代码、setTimeout、setInterval等属于宏任务
Process.nextTick（Node独有）、Promise属于微任务

 */


// 代码题

// 一
//     const promise1 =  new Promise((resolve,reject) => {
//         setTimeout(() => {
//             var a = 'hello '
//             console.log(a)
//             resolve(a)
//         },1000)
//     })
// function promise2(value){
//     return new Promise((resolve,reject) => {
//         setTimeout(() => {
//             var b = 'lagou '
//             console.log(b)
//             resolve(value+b)
//         },1000)
//     })
// }
// function promise3(value){
//     return new Promise((resolve,reject) => {
//         setTimeout(() => {
//             var c = 'I ♥ you'
//             console.log(c)
//             resolve(value+c)
//         },1000)
//     })
// }
// promise1.then(value => {
//     return promise2(value)
// }).then(value => {
//     return promise3(value)
// }).then(value => {
//     console.log(value)
// })

// promise源码


    // promise时一个类，通过执行器去立即执行这个类
    const PENDING = 'pending'
    const FULFILLED = 'fulfilled'
    const REJECTED = 'reject'
    class MyPromise{
        // promise是一个类，传递一个执行器立即执行
        constructor(executor){
            try {
                executor(this.resolve,this.reject)
            } catch (error) {
                this.reject(e)
            }
        }
        // 成功之后的值
        value = undefined
        // 失败的原因
        reason = undefined
        successCallback = []
        failCallback = []
        status = PENDING
        resolve = (value) => {
            // 如果状态不是pending阻止程序向下执行
            if(this.status !== PENDING) return
            // 将状态更改为成功
            this.status = FULFILLED
            // 保存成功之后的值
            this.value = value
            while(this.successCallback.length) this.successCallback.shift()()
        }

        reject = (reason) => {
            if(this.status !== PENDING) return
            // 状态更改为失败
            this.status = REJECTED
            // 保存失败的值
            this.reason = reason
            while(this.failCallback.length) this.failCallback.shift()()
        }
        then(successCallback,failCallback){
            successCallback ? successCallback : value => value
            let promise2 = new MyPromise((resolve,reject) => {
                // 判断状态
                if(this.status === FULFILLED){
                    setTimeout(() => {
                        try {
                            let x = successCallback(this.value)
                            // 判断X的值是普通值还是promise对象
                            // 如果是普通值，直接调用resolve
                            // 如果是promise对象，查看promise返回的值
                            // 再根据promise对象返回的结果，决定调用resolve还是reject
                            resolvePromise(promise2,x,resolve,reject)
                        } catch (error) {
                            reject(error)  
                        }
                    },0)
                }else if(this.status === REJECTED){
                    setTimeout(() => {
                        try {
                            let x = failCallback(this.reason)
                            // 判断X的值是普通值还是promise对象
                            // 如果是普通值，直接调用resolve
                            // 如果是promise对象，查看promise返回的值
                            // 再根据promise对象返回的结果，决定调用resolve还是reject
                            resolvePromise(promise2,x,resolve,reject)
                        } catch (error) {
                            reject(error)  
                        }
                    },0)
                } else {
                    this.successCallback.push(() => {
                        setTimeout(() => {
                            try {
                                let x = successCallback(this.value)
                                // 判断X的值是普通值还是promise对象
                                // 如果是普通值，直接调用resolve
                                // 如果是promise对象，查看promise返回的值
                                // 再根据promise对象返回的结果，决定调用resolve还是reject
                                resolvePromise(promise2,x,resolve,reject)
                            } catch (error) {
                                reject(error)  
                            }
                        },0)
                    })
                    this.failCallback.push(() => {
                        setTimeout(() => {
                            try {
                                let x = failCallback(this.reason)
                                // 判断X的值是普通值还是promise对象
                                // 如果是普通值，直接调用resolve
                                // 如果是promise对象，查看promise返回的值
                                // 再根据promise对象返回的结果，决定调用resolve还是reject
                                resolvePromise(promise2,x,resolve,reject)
                            } catch (error) {
                                reject(error)  
                            }
                        },0)
                    })
                }
            })
            return promise2
        }
    }
function resolvePromise(promise2,x,resolve,reject){
    if(promise2 === x){
        return reject(new TypeError('Chaning cycle deleted for promise #<Promise>'))
    }
    if(x instanceof MyPromise){
        x.then(resolve,reject)
    } else {
        resolve(x)
    }

}
module.exports = MyPromise
