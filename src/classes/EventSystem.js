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

    _extractEvents: function (string) {
        return string.split(',').map(function(event) {
            return event.trim();
        });
    },

    /**
     * Add callback to a target event.
     *
     * @param  {string}   event
     * @param  {string}   target
     * @param  {Function} callback
     */
    on: function (event, target, callback) {
        this._callbacks[target] = this._callbacks[target] || {};
        var events = this._extractEvents(event);
        for (var i = 0, len = events.length; i < len; ++i) {
            this._callbacks[target][events[i]] = this._callbacks[target][events[i]] || [];
            if (this._callbacks[target][events[i]].indexOf(callback) === -1) {
                this._callbacks[target][events[i]].push(callback);
            }
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
        if (this._callbacks[target]) {
            var events = this._extractEvents(event);
            for (var i = 0, len = events.length; i < len; ++i) {
                if (!this._callbacks[target][events[i]]) {
                    continue;
                }
                var index = this._callbacks[target][events[i]].indexOf(callback);
                if (index !== -1) {
                    this._callbacks[target][events[i]].splice(index, 1);
                }
            }
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
        if (this._callbacks[target]) {
            var events = this._extractEvents(event);
            var j;
            var len2;
            var args = Array.prototype.slice.call(arguments, 2);
            for (var i = 0, len = events.length; i < len; ++i) {
                if (!this._callbacks[target][events[i]]) {
                    continue;
                }
                for (j = 0, len2 = this._callbacks[target][events[i]].length; j < len2; ++j) {
                    // If listener returns false, stop propagating
                    if (false === this._callbacks[target][events[i]][j].apply(this, args)) {
                        break;
                    }
                }
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
