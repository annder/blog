// @ts-check
import types from './types';
let utils = {
    /**
     * @description 数组扁平化
     * @param {Array} values
     * @return {Array} 
     */
    flatten(values) {
        return types.isArray(values) ?
            [].concat(...values.map(utils.flatten)) :
            [values];
    },
    /**
     * @description 数组去重
     * @param {Array} values 
     * @return {Array}
     */
    uniq(values) {
        return Array.from(new Set(values))
    },
    /**
     * @param {Object} values
     */
    toParams(values) {
        if (!types.isObject(values)) {
            return ""
        }
        let res = "?"
        for (let [value, key] of Object.entries(values)) {
            res += `${value}=${key}&`
        }
        if (res[res.length - 1] === "&") {
            // 删除最后一个数
            res = res.substr(0, res.length - 1);
        }
        return res;
    }
}
export default utils 