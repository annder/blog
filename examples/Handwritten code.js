Function.prototype.__call = function(context = window) {
  context.fn = this; // 指向this
  const args = [...arguments].slice(1);
  const run = context.fn(...args);
  delete context.fn;
  return run;
};

Function.prototype.__apply = function(context = window) {
  context.fn = this;
  const [, args] = arguments;
  const run = args ? context.fn(...args) : context.fn();
  delete context.fn;
  return run;
};

Function.prototype.myBind = function(context) {
  if (typeof this !== 'function') {
    throw new TypeError('Error');
  }
  //返回一个绑定this的函数，这里我们需要保存this
  const _this = this;
  const args = [...arguments].slice(1);
  //返回一个函数
  return function F() {
    return this instanceof F
      ? new _this(...args, ...arguments)
      : _this.apply(context, args.concat(...arguments));
  };
};
