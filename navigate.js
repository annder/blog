// @ts-nocheck

import types from './types';
import utils from './utils';
/**
 * 
 * @param {String|*} name 
 * @param {String|*} url 
 * @param {Object|*} params 
 */
function usingParams(name, url, params = "") {
    if (!types.isString(url)) {
        if (!types.isObject(params)) {
            return;
        }
    }

    let paramUrl = url += utils.toParams(params);
    // return wx[name]({ url: paramUrl })
    // @ts-ignore
    // 

}

const navigator = {
    /**
     * @param {String|*} url
     * @param {Object|*} params
     */
    navigatorTo(url, params) {
        usingParams("navigatorTo", url, params);
    },
    /**
     * 
     * @param {String} url 
     */
    switchTab(url) {
        if (types.isString(url)) {
            wx.switchTab({ url })
        }
    },

}

console.log(usingParams("", "./name"));

export default navigator;