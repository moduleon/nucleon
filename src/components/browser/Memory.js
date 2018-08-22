// Requirements
var accessor = require('../../../src/components/property/PropertyAccessor');

/**
 * Memory offers an api for dealing with browser memory.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var Memory = function () {
    this._storage = window.localStorage || window.globalStorage || {};
    this._root = this._storage[this._namespace] ? JSON.parse(this._storage[this._namespace]) : {};
};

Memory.prototype = {

    _storage: {},
    _root: {},
    _namespace: 'nucleon_app',

    _save: function () {
        var self = this;
        setTimeout(function () {
            self._storage[self._namespace] = JSON.stringify(self._root);
        }, 0);
    },

    /**
     * Set a value in memory.
     *
     * @param {string} path  is the path to the property (dot.separated)
     * @param {mixed}  value is the value to save in this property
     */
    set: function (path, value) {
        accessor.setPropertyValue(this._root, path, value);
        this._save();

        return this;
    },

    /**
     * Get a value in memory.
     *
     * @param {string} path is the path to the property (dot.separated)
     * @return {mixed}
     */
    get: function (path) {
        return accessor.getPropertyValue(this._root, path);
    },

    /**
     * Get all values stored in memory.
     *
     * @return {object}
     */
    all: function () {
        return this._root;
    },

    /**
     * Remove a value from memory.
     *
     * @param {string} path is the path to the property (dot.separated)
     */
    remove: function (path) {
        accessor.removeProperty(this._root, path);
        this._save();

        return this;
    },

    /**
     * Delete all values from memory.
     */
    clear: function () {
        this._root = {};
        this._save();

        return this;
    }
};

module.exports = new Memory();
