# 手写一个`apply`

它和`call`的形式类似，但是不同的它第二个参数传递的是数组。

和`call`的写法类似的，但是需要的是，注意数组的判断。

```js
Function.prototype.__apply = function (context = window) {
  context.fn = this;
  const [, args] = arguments;
  const run = args ? context.fn(...args) : context.fn();
  return run;
};
```