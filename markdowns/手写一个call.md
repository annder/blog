# 手写一个`call`

`call`的作用是为函数指定`this`作用域，然后此函数可以调用`this`作用域上的数据。

```js
Function.prototype.__call = function (context = window) {
  context.fn = this;
  const args = [...arguments].slice(1);
  const run = context.fn(...args);
  delete context.fn;
  return run;
};
```
