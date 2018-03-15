// Requirements
var Collection = require('../../../../src/components/model/classes/Collection');
var EventSystem = require('../../../../src/classes/EventSystem');
var accessor = require('../../../../src/components/property/PropertyAccessor');

/**
 * Model is a constructor for observable objects.
 *
 * @constructor
 * @param {object} obj
 * @return {Model}
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var Model = function (obj) {

    var es = new EventSystem();
    accessor.duplicateProperties(obj, this);
    watch(this, null, es);

    this.on = function (event, path, callback) {
        es.on(event, path, callback);
    };

    this.trigger = function (event, path, newValue) {
        if ('change' === event) {
            var oldValue = accessor.getPropertyValue(this, path);
            if (newValue !== oldValue) {
                accessor.setPropertyValue(this, path, newValue);
            }
        }
    };

    return this;
};

function watch (target, path, es) {
    var prop;
    var propType;
    for (prop in target) {
        propType = accessor.getTypeOf(target[prop]);
        if (!target.hasOwnProperty(prop) || 'function' === propType) {
            continue;
        }
        (function (actualPath) {
            watchProperty(target, prop, function (event, prop, newValue, oldValue) {
                es.trigger(event, actualPath, newValue, oldValue);
            });
            watchObjectOrArray(target, prop, actualPath, target[prop], propType, es);
        }(path ? (path + '.' + prop) : prop));
    }
}

function watchObjectOrArray(target, prop, path, value, propType, es) {

    if (target[prop] instanceof Collection) {
        return;
    }

    propType = propType || accessor.getTypeOf(value);

    // Object detected
    if ('object' === propType) {
        // Recursing binding
        watch(target[prop], path, es);
        es
            // If object in a prop is replaced by another one
            .on('change', path, function () {
                // Watch new object
                watch(target[prop], path, es);
                // Trigger related listener, to force refreshing
                for (var propPath in es._callbacks) {
                    if (path !== propPath && -1 !== propPath.indexOf(path)) {
                        es.trigger('change', propPath, accessor.getPropertyValue(target[prop], propPath));
                    }
                }
            })
        ;
    // Array detected
    } else if ('array' === propType) {
        // Turn it into a collection
        target[prop] = new Collection(value, function (event, change) {
            es.trigger(event, path, change);
        });
        // Recursing binding
        watch(target[prop], path, es);
        es
            // If collection in a prop is replaced by an array
            .on('change', path, function (value) {
                if (target[prop] instanceof Collection) {
                    return;
                }
                // Watch the new one, turn it into a Collection
                value = value || target[prop];
                delete target[prop];
                target[prop] = new Collection(value, function (event, change) {
                    es.trigger(event, path, change);
                });
                watchProperty(target, prop, function (event, prop, newValue, oldValue) {
                    es.trigger(event, path, newValue, oldValue);
                });
                watch(target[prop], path, es);
            })
            // If adding in collection
            .on('add', path, function (changes) {
                var index;
                // Multiple adding
                if (changes instanceof Array) {
                    for (var i = 0, len = changes.length; i < len; ++i) {
                        index = target[prop].indexOf(changes[i]);
                        (function (actualPath) {
                            watchProperty(target[prop], index, function (event, prop, newValue, oldValue) {
                                es.trigger(event, actualPath, newValue, oldValue);
                            });
                            watchObjectOrArray(target[prop], index, actualPath, target[prop][index], null, es);
                        }(path ? (path + '.' + index) : index));
                    }
                // Single adding
                } else {
                    index = target[prop].indexOf(changes);
                    (function (actualPath) {
                        watchProperty(target[prop], index, function (event, prop, newValue, oldValue) {
                            es.trigger(event, actualPath, newValue, oldValue);
                        });
                        watchObjectOrArray(target[prop], index, actualPath, target[prop][index], null, es);
                    }(path ? (path + '.' + index) : index));
                }
            })
        ;
    }
}

function watchProperty (target, prop, handler) {
    var value = target[prop];
    var oldValue = value;
    accessor.redefineProperty(
        target,
        prop,
        function () {
            return value;
        },
        function (newValue) {
            oldValue = value;
            value = newValue;
            if (oldValue !== newValue) {
                handler('change', prop, newValue, oldValue);
            }
        }
    );
}

module.exports = Model;
