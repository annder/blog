import { isFunction, isObject } from 'lodash';
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

/**
 * @description 是否为等待状态
 * @param {*} value
 * @return {Boolean}
 * */

const isPending = value => value === PENDING;
const isFulfilled = value => value === FULFILLED;
const isReject = value => value === REJECTED;

class SelfPromise {
  constructor(fn) {
    this.state = PENDING;

    this.value = Object.create(null);
    this.reason = Object.create(null);

    this.resolveCb = [];
    this.rejectCb = [];

    /**
     * @description 解决成功回调的机制
     * @param {*} value
     * */

    const resolve = value => {
      setTimeout(() => {
        if (isPending(this.state)) {
          this.state = FULFILLED;
          this.value = value;
          this.resolveCb.forEach(cb => {
            this.value = cb(this.value);
          });
        }
      });
    };

    /**
     * @description 解决失败回调的机制
     * @param {*} reason
     * */

    const reject = reason => {
      setTimeout(() => {
        if (isPending(this.state)) {
          this.state = REJECTED;
          this.reason = reason;
          this.rejectCb.forEach(cb => {
            this.reason = cb(this.reason);
          });
        }
      });
    };

    try {
      fn(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  /**
   * @description 返回Promise
   * @param {*|Function} fulfilled
   * @param {*|Function} rejected
   * */

  then(fulfilled, rejected) {
    // 是否为为函数，如果是，那么就返回一个接收成功的函数
    fulfilled = isFunction(fulfilled) ? fulfilled : value => value;
    // 如果为函数，那么停止运行，并抛出错误
    rejected = isFunction
      ? rejected
      : reason => {
          throw reason;
        };

    const pushCbs = (thenFns, rejected, instancePromise) => value => {
      try {
        // 如果返回了一个value值
        const returnValue = thenFns(value);
        // 解决它为Promise
        resolvePromise(instancePromise, returnValue);
      } catch (e) {
        // 如果它抛出了一个异常，那么promise就必须拒绝执行
        rejected(e);
      }
    };

    // Then必须得返回一个Promise
    let resolveReturnPromise;

    // 无论是fulfilled，还是rejected都会下一步调用then
    if (isFulfilled(this.state)) {
      return (resolveReturnPromise = new SelfPromise((resolve, reject) => {
        setTimeout(() => {
          pushCbs(fulfilled, reject, resolveReturnPromise)(this.value);
        });
      }));
    }

    if (isReject(this.state)) {
      return (resolveReturnPromise = new SelfPromise((resolve, reject) => {
        setTimeout(() => {
          pushCbs(fulfilled, reject, resolveReturnPromise)(this.reason);
        });
      }));
    }

    return (resolveReturnPromise = new SelfPromise((resolve, reject) => {
      this.resolveCb.push(pushCbs(fulfilled, reject, resolveReturnPromise));
      this.rejectCb.push(pushCbs(rejected, reject, resolveReturnPromise));
    }));
  }
}

function resolvePromise(promise, instancePromise, resolve, reject) {
  if (promise === instancePromise) {
    reject(new ReferenceError('error:循环引用'));
  }

  if (instancePromise instanceof SelfPromise) {
    if (isPending(instancePromise.state)) {
      /**
       * @description 重新解决Promise
       * @param {SelfPromise} otherInstancePromise
       * */

      const resetResolvePromise = otherInstancePromise => {
        resolvePromise(promise, otherInstancePromise, resolve, reject);
      };
      // 等待执行，直到执行完毕
      instancePromise.then(resetResolvePromise, reason => {
        reject(reason);
      });
    } else {
      // 如果不是等待状态的话，那么直接resolve！
      instancePromise.then(resolve, reject);
    }
  } else if (
    instancePromise &&
    (isFunction(instancePromise) || isObject(instancePromise))
  ) {
    let isCalled = false;
    try {
      let then = instancePromise.then;

      if (isFunction(then)) {
        then.call(
          instancePromise, // 传递上下作用域
          __resolve__ => {
            // 如果是then返回了一个函数的话，那么重新resolve一次。
            if (isCalled) return;
            isCalled = true;
            resolvePromise(promise, __resolve__, resolve, reject);
          },
          __reject__ => {
            if (isCalled) return; // 如果已经resolve，那么直接返回错误
            isCalled = true;
            reject(__reject__);
          }
        );
      } else {
        resolve(instancePromise);
      }
    } catch (e) {
      if (isCalled) return;
      isCalled = false;
      reject(e);
    }
  } else {
    resolve(instancePromise);
  }
}

SelfPromise.deferred = () => {
  let defer = {};
  defer.promise = new SelfPromise((resolve, reject) => {
    defer.resolve = resolve;
    defer.reject = reject;
  });
  return defer;
};
