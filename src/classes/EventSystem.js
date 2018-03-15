/**
 * EventSystem offers a simple event-oriented pubsub system.
 *
 * @constructor
 * @return {EventSystem}
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var EventSystem = function () {
    this._callbacks = {};

    return this;
};

EventSystem.prototype = {

    /**
     * Callbacks storage.
     *
     * @type {Object}
     */
    _callbacks: null,

    /**
     * Add callback to a target event.
     *
     * @param  {string}   event
     * @param  {string}   target
     * @param  {Function} callback
     */
    on: function (event, target, callback) {
        this._callbacks[target] = this._callbacks[target] || {};
        this._callbacks[target][event] = this._callbacks[target][event] || [];
        if (this._callbacks[target][event].indexOf(callback) === -1) {
            this._callbacks[target][event].push(callback);
        }

        return this;
    },

    /**
     * Remove callback from a target event.
     *
     * @param  {string}   event
     * @param  {string}   target
     * @param  {Function} callback
     */
    off: function (event, target, callback) {
        if (!this._callbacks[target] || !this._callbacks[target][event]) {
            return;
        }
        var index = this._callbacks[target][event].indexOf(callback);
        if (index !== -1) {
            this._callbacks[target][event].splice(index, 1);
        }

        return this;
    },

    /**
     * Trigger a target event.
     *
     * @param  {string} event
     * @param  {string} target
     */
    trigger: function (event, target) {
        if (!this._callbacks[target] || !this._callbacks[target][event]) {
            return;
        }
        for (var i = 0, len = this._callbacks[target][event].length; i < len; ++i) {
            // If listener returns false, stop propagating
            if (false === this._callbacks[target][event][i].apply(this, Array.prototype.slice.call(arguments, 2))) {
                return false;
            }
        }

        return this;
    },

    /**
     * Remove all _callbacks.
     */
    clear: function () {
        this._callbacks = {};

        return this;
    }
};

module.exports = EventSystem;
