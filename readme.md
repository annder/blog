# Annex blog

## 目录

[手写判断 Promise 类型](##如何判断`Priomse`类型？)

[手写 call](##手写一个`call`)

[手写一个 apply](##手写一个`apply`)

[手写一个 bind](##手写一个`bind`)

[在ubuntu系统下安装并使用Nginx](##在ubuntu系统下安装并使用Nginx)

## 如何判断`Priomse`类型？

1. `Promise`带有`then`
2. `Promise`的`constructor`是`Promise`
3. `Promise`的`Object.prototype.toString`类型是`[object Promise]`

实现：

```js
const toStringObject = value => Object.prototype.toString.call(value);

const isPromise = value =>
  value &&
  value.then &&
  typeof value.then === 'function' &&
  value instanceof Promise &&
  toStringObject(value) === '[object Promise]';
```

- 如何判断`Symbol`类型？

1. `Symbol`的`typeof`是`Symbol`
2. `Symbol`的`Object.prototype.toString`类型是`[object Symbol]`

实现：

```js
const toStringObject = value => Object.prototype.toString.call(value);
const isSymbol = value => typeof value === 'symbol' && toStringObject(value);
```

## 手写一个`call`

`call`的作用是为函数指定`this`作用域，然后此函数可以调用`this`作用域上的数据。

```js
Function.prototype.__call = function(context = window) {
  context.fn = this;
  const args = [...arguments].slice(1);
  const run = context.fn(...args);
  delete context.fn;
  return run;
};
```

## 手写一个`apply`

它和`call`的形式类似，但是不同的它第二个参数传递的是数组。

和`call`的写法类似的，但是需要的是，注意数组的判断。

```js
Function.prototype.__apply = function(context = window) {
  context.fn = this;
  const [, args] = arguments;
  const run = args ? context.fn(...args) : context.fn();
  return run;
};
```

## 手写一个`bind`

它和`call`不同，因为它传入的是一个函数，所以需要返回一个函数来接受，但是有时候可能`new`一个新函数。

所以需要添加一个`new`的函数来做接收。

```js
Function.prototype.__bind = function(context = window) {
  if (typeof this !== 'function') {
    throw new TypeError('Error');
  }
  const _this = this;
  const args = [...arguments].slice(1);
  return function F() {
    return this instanceof F
      ? new _this(...args, ...arguments)
      : _this.apply(context, args.concat(...arguments));
  };
};
```

## 手写一个 Promise

写一个符合`Promise A+`的 Promise，这里不再赘述，看这一篇就可以了：[Promise/A+规范](https://www.ituring.com.cn/article/66566)

简易版：

```js
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class SelfPromise {
  constructor(fn) {
    this.state = PENDING;

    this.value = null;
    this.reason = null;

    this.resolveCbs = [];
    this.rejectCbs = [];

    const resolve = value => {
      this.value = value;
      setTimeout(function() {
        if (this.state === PENDING) {
          this.state = FULFILLED;
          this.resolveCbs.forEach(cb => {
            this.value = cb(this.value);
          });
        }
      });
    };

    const rejected = reason => {
      this.reason = reason;
      setTimeout(function() {
        if (this.state === PENDING) {
          this.state = REJECTED;
          this.rejectCbs.forEach(cb => {
            this.reason = cb(this.reason);
          });
        }
      });
    };
  }

  then(resolveFn, rejectFn) {
    typeof resolveFn === 'function' && this.resolveCbs.push(resolveFn);
    typeof rejectFn === 'function' && this.rejectCbs.pish(rejectFn);
    return this;
  }
}
```

然而这个并没有解决，`Promise A+`的问题，下面的代码块即可解决这个问题。

```js
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
```

## 在ubuntu系统下安装并使用Nginx

### 安装

打开终端，然后输入：

```bash
sudo apt-install nginx
```

### 启动、重启、停止

启动：

```bash
service nginx start
```

重启

```bash
service nginx reload
```

停止

```bash
service nginx stop
```


一般而言，在/var/www/html这个文件夹内可以编写nginx的html文件。

有四个路径极为关键：

- /usr/sbin/nginx：主程序

- /etc/nginx：存放配置文件

- /usr/share/nginx：存放静态文件

- /var/log/nginx：存放日志

## 编写Nginx文件

### 设置静态HTTP服务器

设置静态HTTP服务器只需要在http模块下直接添加server即可。

```diff
work_processes 1;

events {
  worker_connecitons 1024;
}

http {
+  server / {
+    root /var/html/www/ # 静态服务器文件目录
+  }
}
```

###　设置反向代理与负载均衡

直接在它的基础上添加proxy_pass即可：

```diff
work_processes 1; # CUP核心数

events {
  worker_connecitons 1024;
}

http {
  server / {
-    root /var/html/www/ # 静态服务器文件目录
+    proxy_pass http://192.168.1.1
  }
}
```

上面的一个代理是远远不够的，如果一个代理的挂掉了之后，那么这个服务器就无法使用，进而挂掉HTTP服务器。

既然如此，我们可以使用多个代理来解决这个问题：

```diff
work_processes 1; # CUP核心数

events {
  worker_connecitons 1024;
}

http {
+  upstream proxys {
+    server 123.123.123.1
+    server 123.124.123.2
+  }
  server / {
-    proxy_pass http://192.168.1.1
+    proxy_pass http://proxys
  }
}
```

这样就完成了负载均衡的配置。

