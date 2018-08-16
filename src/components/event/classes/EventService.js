// Requirements
var DOMManipulator = require('@/components/dom/DOMManipulator');

/**
 * EventService instances gives an api for dealing with dom events.
 *
 * @constructor
 * @return {EventService}
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var EventService = function () {
    this._listeners = [];

    return this;
};

EventService.prototype = {

    _listeners: null,

    _extractEvents: function (string) {
        return string.split(',').map(function(event) {
            return event.trim();
        });
    },

    _findTarget: function (event, selector, callback) {
        if (this._listeners[event]) {
            for (var i = 0, len = this._listeners[event].length; i < len; ++i) {
                if (selector === this._listeners[event][i].selector && callback === this._listeners[event][i].callback) {
                    return this._listeners[event][i];
                }
            }
        }

        return null;
    },

    _findTargets: function (event, element) {
        var targets = [];
        for (var i = 0, len = this._listeners[event].length; i < len; ++i) {
            if (DOMManipulator.isMatching(this._listeners[event][i].selector, element)) {
                targets.push(this._listeners[event][i]);
            }
        }

        return targets;
    },

    _addTarget: function (event, selector, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        if (!this._findTarget(event, selector, callback)) {
            this._listeners[event].push({
                selector: selector,
                callback: callback
            });
        }
    },

    _removeTarget: function (event, selector, callback) {
        var target = this._findTarget(event, selector, callback);
        if (target) {
            this._listeners[event].splice(this._listeners[event].indexOf(target), 1);
        }
    },

    _addListener: function (event, element, callback) {
        if (element.addEventListener) {
            element.addEventListener(event, callback, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + event, function () {
                return (callback.call(window.event.srcElement, window.event));
            });
        } else {
            throw new Error('Given element can not have a listener.');
        }
    },

    _removeListener: function (event, element, callback) {
        if (element.removeEventListener) {
            element.removeEventListener(event, callback, false);
        } else if (element.detachEvent) {
            element.detachEvent("on" + event, function() {
                return (callback.call(window.event.srcElement, window.event));
            });
        }
    },

    _createEvent: function (type, element) {
        var event;
        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent(type, true, true);
        } else {
            event = document.createEventObject();
            event.eventType = type;
        }
        event.eventName = type;
        event.target = element;

        return event;
    },

    _dispatchEvent: function (event, element) {
        if ('string' === typeof event) {
            event = this._createEvent(event, element);
        }
        if (document.createEvent) {
            element.dispatchEvent(event);
        } else {
            element.fireEvent("on" + event.eventType, event);
        }
    },

    _createDelegatedEvent: function (e) {
        if (!this._listeners[e.type]) {
            return e;
        }

        // With delegation, event target can be a child of spied element.
        // In that case, we must find the parent matching.
        var originalTarget = e.target || e.srcElement;
        var target;
        for (var i = 0, len = this._listeners[e.type].length; i < len; ++i) {
            target = originalTarget;
            while (target && false === DOMManipulator.isMatching(this._listeners[e.type][i].selector, target)) {
                target = target.parentNode && document !== target.parentNode ? target.parentNode : null;
            }
            if (target) {
                break;
            }
        }
        if (!target) {
            return e;
        }

        // Duplicate original event
        var copy = {};
        for (var prop in e) {
            copy[prop] = e[prop];
        }
        // Unify preventDefault and return value
        copy.returnValue = null;
        copy.preventDefault = function () {
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
            this.returnValue = false;
        };
        // Replace target
        copy.target = copy.srcElement = target;

        return copy;
    },

    _delegate: function (e) {
        if (this._listeners[e.type]) {
            var event = this._createDelegatedEvent(e);
            var targets = this._findTargets(event.type, event.target);
            for (var i = 0, len = targets.length; i < len; ++i) {
                targets[i].callback.call(event.target, event);
                if (false === event.returnValue) {
                    return;
                }
            }
        }
    },

    /**
     * Register an event, or mutliple events, for a given element or all elements matching a selector.
     *
     * @param  {string}              events   can be an event name, or multiple event name comma separated
     * @param  {string|HTMLElement}  ref      can be a css selector or an html element
     * @param  {Function}            callback
     */
    on: function (events, ref, callback) {
        events = this._extractEvents(events);
        var isSelector = 'string' === typeof ref;
        for (var i = 0, len = events.length; i < len; ++i) {
            if (isSelector) {
                if (!this._listeners[events[i]]) {
                    var self = this;
                    this._addListener(events[i], document, function (e) { self._delegate(e); });
                }
                this._addTarget(events[i], ref, callback);
            } else {
                this._addListener(events[i], ref, callback);
            }
        }

        return this;
    },

    /**
     * Unegister an event, or mutliple events, for a given element or all elements matching a selector.
     *
     * @param  {string}              events   can be an event name, or multiple event name comma separated
     * @param  {string|HTMLElement}  ref      can be a css selector or an html element
     * @param  {Function}            callback
     */
    off: function (events, ref, callback) {
        events = this._extractEvents(events);
        var isSelector = 'string' === typeof ref;
        for (var i = 0, len = events.length; i < len; ++i) {
            if (isSelector) {
                this._removeTarget(events[i], ref, callback);
            } else {
                this._removeListener(events[i], ref, callback);
            }
        }

        return this;
    },

    /**
     * Trigger an event, or mutliple events, for a given element or all elements matching a selector.
     *
     * @param  {string}              events   can be an event name, or multiple event name comma separated
     * @param  {string|HTMLElement}  ref      can be a css selector or an html element
     */
    trigger: function (events, ref) {
        events = this._extractEvents(events);
        var isSelector = 'string' === typeof ref;
        var targets = isSelector ? DOMManipulator.find(ref) : null;
        for (var i = 0, len = events.length; i < len; ++i) {
            if (isSelector) {
                for (var i2 = 0, len2 = targets.length; i2 < len2; ++i2) {
                    this._dispatchEvent(events[i], targets[i2]);
                }
            } else {
                this._dispatchEvent(events[i], ref);
            }
        }

        return this;
    },

    /**
     * Remove all listeners using css selectors.
     */
    clear: function () {
        for (var event in this._listeners) {
            this._listeners[event] = [];
        }

        return this;
    }
};

module.exports = EventService;
