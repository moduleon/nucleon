// Requirements
var innerEvents = require('../../../src/components/event/InnerEvents');
var redirect = require('../../../src/components/http/Redirect');

/**
 * History offers an api for adding url and callbacks in browser history.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var History = function () {
    this._callbacks = [];
    var self = this;
    innerEvents.on('load', window, function () {
        // We wrap the listener in a setTimeout because of webkit browsers which
        // emit a popstate when page load (safari).
        // Without it, the listener catches it, and the page reload indefinitely.
        setTimeout(function () {
            innerEvents.on('popstate', window, function () {
                self._index = window.history.state ? window.history.state.index : -1;
                // Try to load callback if stored
                if (-1 === self._index && self._loadEntry(self._index)) {
                    return false;
                }
                // Try to find a controller
                if (undefined !== redirect(window.location.href, false)) {
                    return false;
                }
                // In last case, reload
                window.location.replace(window.location.href);
            });
        }, 1);
    });
};

History.prototype = {

    _index: -1,
    _callbacks: null,

    _updateUrl: function (url) {
        window.history.pushState({ index: this.index }, '', url);
    },

    _loadEntry: function (index) {
        if (this._callbacks[index]) {
            this._callbacks[index]();
            return true;
        }
        return false;
    },

    /**
     * Add entry in browser history.
     *
     * @param {string}   url
     * @param {Function} callback
     */
    addEntry: function (url, callback) {
        if (!window.history.pushState) {
            return;
        }
        this._index++;
        if (this._callbacks.length - 1 > this._index) {
            this._callbacks.splice(this._index, this._callbacks.length - this._index);
        }
        this._callbacks[this._index] = callback;
        this._updateUrl(url);
    }
};

module.exports = new History();
