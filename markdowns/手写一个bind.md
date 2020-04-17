# 手写一个`bind`

它和`call`不同，因为它传入的是一个函数，所以需要返回一个函数来接受，但是有时候可能`new`一个新函数。

所以需要添加一个`new`的函数来做接收。

```js
Function.prototype.__bind = function (context = window) {
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
