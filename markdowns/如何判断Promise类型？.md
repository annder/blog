# 如何判断`Priomse`类型？

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
