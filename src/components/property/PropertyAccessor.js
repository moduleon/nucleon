/**
 * PropertyAccessor gives methods to deal with objects properties.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var propertyAccessor = {

    /**
     * Set an object property value.
     *
     * @param {object} target
     * @param {string} path   is a dot separated path to the property
     * @param {mixed}  value
     *
     * @return {object}
     */
    setPropertyValue: function (target, path, value) {
        var props = path.split('.');
        for (var i = 0, len = props.length; i < len; ++i) {
            if (i + 1 < len){
                if (undefined !== target[props[i]]) {
                    target = target[props[i]];
                } else {
                    target = target[props[i]] = {};
                }
            } else {
                target[props[i]] = value;
            }
        }

        return target;
    },

    /**
     * Get an object property value.
     *
     * @param {object} target
     * @param {string} path   is a dot separated path to the property
     *
     * @return {object}
     */
    getPropertyValue: function (target, path) {
        var props = path.split('.');
        for (var i = 0, len = props.length; i < len; ++i) {
            target = target[props[i]];
            if (undefined === target) {
                break;
            }
        }

        return target;
    },

    /**
     * Remove target property.
     *
     * @param  {object} target
     * @param  {string} path
     *
     * @return {object}
     */
    removeProperty: function (target, path) {
        var props = path.split('.');
        for (var i = 0, len = props.length; i < len; ++i) {
            if (i < (len - 1)) {
                target = target[props[i]];
                if (undefined === target) {
                    break;
                }
            } else {
                delete target[props[i]];
            }
        }
    },

    /**
     * Duplicate properties from an object to another.
     *
     * @param {object} source
     * @param {object} target
     */
    duplicateProperties: function (source, target) {
        for (var prop in source) {
            if (!source.hasOwnProperty(prop)) {
                continue;
            }
            target[prop] = source[prop];
        }
    },

    /**
     * Get type of a value.
     *
     * @return {string}
     */
    getTypeOf: function (value) {
        return Object.prototype.toString.call(value).replace('[object ', '').replace(']','').toLowerCase();
    },

    /**
     * Redefine property in an object.
     *
     * @param  {object}   target
     * @param  {string}   prop
     * @param  {function} getter
     * @param  {function} setter
     */
    redefineProperty: function (target, prop, getter, setter) {
        if ('function' === typeof Object.prototype.defineProperty) { // ECMAScript 5
            Object.defineProperty(target, prop, {
                configurable: true,
                enumerable: true,
                get: getter,
                set: setter
            });
        } else if (Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__) { // legacy
            Object.prototype.__defineGetter__.call(target, prop, getter);
            Object.prototype.__defineSetter__.call(target, prop, setter);
        }
    },
};

module.exports = propertyAccessor;
