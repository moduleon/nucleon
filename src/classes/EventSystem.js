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

    _hasCallback: function (event, target, callback) {
        for (var i = 0, len = this._callbacks[target][event].length; i < len; ++i) {
            if (this._callbacks[target][event][i].callback === callback) {
                return i;
            }
        }

        return false;
    },

    /**
     * Add callback to a target event.
     *
     * @param  {String}       event
     * @param  {String}       target
     * @param  {Function}     callback
     * @param  {Array|null}   prependArgs  defines prepending arguments to inject on trigger
     * @param  {Object|null}  caller       defines the object which should be be "this" in callback
     */
    on: function (event, target, callback, prependArgs, caller) {
        this._callbacks[target] = this._callbacks[target] || {};
        var events = this._extractEvents(event);
        for (var i = 0, len = events.length; i < len; ++i) {
            this._callbacks[target][events[i]] = this._callbacks[target][events[i]] || [];
            if (false === this._hasCallback(events[i], target, callback)) {
                this._callbacks[target][events[i]].push({
                    callback: callback,
                    prependArgs: prependArgs || [],
                    caller: caller || this
                });
            }
        }

        return this;
    },

    /**
     * Remove callback from a target event.
     *
     * @param  {String}   event
     * @param  {String}   target
     * @param  {Function} callback
     */
    off: function (event, target, callback) {
        if (this._callbacks[target]) {
            var events = this._extractEvents(event);
            for (var i = 0, len = events.length; i < len; ++i) {
                if (!this._callbacks[target][events[i]]) {
                    continue;
                }
                var index = this._hasCallback(events[i], target, callback);
                if (false !== index) {
                    this._callbacks[target][events[i]].splice(index, 1);
                }
            }
        }

        return this;
    },

    /**
     * Trigger a target event.
     *
     * @param  {String} event
     * @param  {String} target
     */
    trigger: function (event, target) {
        if (this._callbacks[target]) {
            var events = this._extractEvents(event);
            var args = Array.prototype.slice.call(arguments, 2);
            var current;
            for (var i = 0, len = events.length, j, len2; i < len; ++i) {
                if (!this._callbacks[target][events[i]]) {
                    continue;
                }
                for (j = 0, len2 = this._callbacks[target][events[i]].length; j < len2; ++j) {
                    current = this._callbacks[target][events[i]][j];
                    // If listener returns false, stop propagating
                    if (false === current.callback.apply(current.caller, current.prependArgs.concat(args))) {
                        break;
                    }
                }
            }
        }

        return this;
    },

    /**
     * Remove all callbacks.
     */
    clear: function () {
        this._callbacks = {};

        return this;
    }
};

module.exports = EventSystem;
