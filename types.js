// @ts-check
/**
 *
 * @param {*} value
 * @return {String}
 */
const toStringObject = value => Object.prototype.toString.call(value);

const OBJECT_STRING = '[object String]';
const OBJECT_ARRAY = '[object Array]';
const OBJECT_NUMBER = '[object Number]';
const OBJECT_OBJECT = '[object Object]';
const types = {
  /**
   * @description 是否为字符串
   * @param {*} value
   * @return {Boolean}
   */
  isString(value) {
    return (
      (toStringObject(value) === OBJECT_STRING && typeof value === 'string') ||
      // @ts-ignore
      value instanceof String
    );
  },
  /**
   * @description 是否为数组
   * @param {*} value
   */
  isArray(value) {
    return (
      toStringObject(value) === OBJECT_ARRAY &&
      Array.isArray(value) &&
      value instanceof Array
    );
  },
  /**
   * @description 是否为数字
   * @param {*} value
   * @return {Boolean}
   */
  isNumber(value) {
    return (
      toStringObject(value) === OBJECT_NUMBER &&
      typeof value === 'number' &&
      // @ts-ignore
      value instanceof Number
    );
  },
  /**
   * @description 是否为对象
   * @param {*} value
   * @return {Boolean}
   */
  isObject(value) {
    return (
      value != null &&
      typeof value == 'object' &&
      Array.isArray(value) === false &&
      toStringObject(value) === OBJECT_OBJECT
    );
  },
  /**
   * @param {any} value
   * */

  isPromise: value =>
    value &&
    value.then &&
    typeof value.then === 'function' &&
    value instanceof Promise &&
    toStringObject(value) === '[object Promise]',

  /**
   * @param {any} value
   * */

  isSymbol: value =>
    typeof value === 'symbol' && toStringObject(value) === '[object Symbol]'
};

export default types;
