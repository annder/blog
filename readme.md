# Annex blog

- 如何判断`Priomse`类型？

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

- 手写一个`call`

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

- 手写一个`apply`

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

- 手写一个`bind`

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
