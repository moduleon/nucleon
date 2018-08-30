/**
 * Collection turns an array into an observable array-like object.
 *
 * @constructor
 * @param {array} source
 * @param {function} handler
 * @return {Collection}
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var Collection = function (source, handler) {
    for (var i = 0, len = source.length; i < len; ++i) {
        this[i] = source[i];
    }
    this.length = source.length;
    this._handler = handler;

    return this;
};

var arrayProto = Array.prototype;

var clone = function (obj) {
    var cloned = [];
    for (var i = 0, len = obj.length; i < len; ++i) {
        cloned.push(obj[i]);
    }

    return cloned;
};

// Defining setters from Array prototype
// Adding changes handler.
var setters = {
    'pop': 'remove', 'push': 'add', 'reverse': 'change', 'shift': 'remove',
    'sort': 'change', 'splice': 'remove', 'unshift': 'add'
};
for (var method in setters) {
    (function (method) {
        Collection.prototype[method] = function () {
            var oldValue = clone(this);
            var event = setters[method];
            var returnValue = arrayProto[method].apply(this, arguments);
            var change;
            if ('remove' === event || 'change' === event) {
                change = returnValue;
            } else if ('add' === event) {
                change = arguments[1] ? arrayProto.slice.call(arguments) : arguments[0];
            }
            this._handler(event, change, oldValue);
            if ('change' !== event) {
                this._handler('change', this, oldValue);
            }

            return returnValue;
        };
    }(method));
}

// Defining getters from Array prototype
var getters = [
    'concat', 'every', 'filter', 'forEach', 'indexOf', 'join', 'lastIndexOf', 'map',
    'reduce', 'reduceRight', 'slice', 'some', 'toLocaleString', 'toString'
];
for (var i = 0, len = getters.length; i < len; ++i) {
    Collection.prototype[getters[i]] = arrayProto[getters[i]];
}

module.exports = Collection;
