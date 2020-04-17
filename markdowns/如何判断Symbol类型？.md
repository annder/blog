# 如何判断`Symbol`类型？

1. `Symbol`的`typeof`是`Symbol`
2. `Symbol`的`Object.prototype.toString`类型是`[object Symbol]`

实现：

```js
const toStringObject = value => Object.prototype.toString.call(value);
const isSymbol = value => typeof value === 'symbol' && toStringObject(value);
```
