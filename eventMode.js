//@ts-check
/** @type {Object} */
const eventEmitter = {
    /**
     * @description 订阅者模式
     *  @type {Object} */
    subscriber: {
        /** @type {Array} */
        subs: [],
        /**
         * @description 添加订阅
         * @param {String} event
         * @param {Function} cb
         */
        on(event, cb) {
            (this.subs[event] || (this.subs[event] = [])).push(cb)
        },

        /**
         * @description 触发订阅事件
         * @param {string | number} event
         * @param {any[]} args
         */
        trigger(event, ...args) {
            this.subs[event] && this.subs.forEach(cb => { cb(...args) })
        },
        /**
         * @description 只订阅一次
         * @param {string} event
         * @param {Function} onceCb
         */
        once(event, onceCb) {
            /**
             * @param {any[]} args
             */
            const cb = (...args) => {
                onceCb(...args)
                this.off(event, onceCb)
            }
            this.on(event, cb)
        },
        /**
         * @param {string | number} event
         * @param {Function} offCb
         */
        off(event, offCb) {
            if (this.subs[event]) {
                let index = this.subs.findIndex(cb => cb === offCb);
                this.subs.splice(index, 1)
                if (!this.subs[event].length) delete this.subs[event]
            }
        }
    },
}
