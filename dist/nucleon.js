var app =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 14);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/**
 * DOMManipulator gives a api to perform CRUD operations on DOM.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var DOMManipulator = function () {
    this._locations = [];
};

DOMManipulator.prototype = {

    _locations: null,

    _escapeNestedQuotes: function (string) {
        var escaped = '';
        var inTag = false;
        var openQuotes = 0;
        for (var i = 0, len = string.length, k; i < len; ++i) {
            k = string[i];
            if ('<' === k && false === inTag && 0 === openQuotes) {
                inTag = true;
            }
            if ('>' === k && true === inTag && 0 === openQuotes) {
                inTag = false;
            }
            if ('"' === k && inTag) {
                ++openQuotes;
                if (openQuotes > 1) {
                    if (0 !== openQuotes % 2 || (0 === openQuotes % 2 && (' ' === string[i + 1] || '>' === string[i + 1]))) {
                        openQuotes -= 2;
                    }
                    if (openQuotes > 0) {
                        k = '&quot;';
                    }
                }
            }
            escaped += k;
        }

        return escaped;
    },

    _escapeCodeTags: function (string) {
        var ALL_TAGS_PATTERN = /<code[ a-z"'-_=|]*>(?:(?!<code).|[\r\n])*<\/code>/gi;
        var codes = string.match(ALL_TAGS_PATTERN);
        if (codes) {
            var INNER_TAG_PATTERN  = /<code[ a-z"'-_=|]*>((?:(?!<code).|[\r\n])*)<\/code>/i;
            for (var i = 0, len = codes.length, inner, escaped; i < len; ++i) {
                inner = codes[i].match(INNER_TAG_PATTERN)[1];
                escaped = codes[i].replace(inner, inner.replace(/</g, '&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'));
                string = string.replace(codes[i], escaped);
            }
        }

        return string;
    },

    _escapeSelector: function (selector) {
        return selector
            .replace(/#([0-9])/g, '#\\3$1 ')               // for browsers generating error when id start with a number
            .replace(/:+((?!not)[^: ]*)/g, '[type="$1"]'); // for browsers generating error when using ':' as element type selector
    },

    _removeComments: function (string) {
        var COMMENTS_PATTERN = /<!--[^>]*-->/gi;
        string = string.replace(COMMENTS_PATTERN, '');

        return string;
    },

    /**
     * Create an element from string.
     *
     * @param  {string} string
     *
     * @return {HTMLElement|DocumentFramgent}
     */
    createElement: function (string) {
        // Clean html
        string = string.trim();
        string = this._removeComments(string);
        string = this._escapeCodeTags(string);
        string = this._escapeNestedQuotes(string);

        // Turn string into html elements
        var el = null;
        var temp = document.createElement('temp');
        temp.innerHTML = string;

        // Return element directly if alone
        if (temp.childNodes.length === 1) {
            el = temp.firstChild.cloneNode(true);

        // Return document fragment if multiple elements
        } else if (temp.childNodes.length > 1) {
            el = document.createDocumentFragment();
            for (var i = 0, len = temp.childNodes.length; i < len; ++i) {
                el.appendChild(temp.childNodes[i].cloneNode(true));
            }
        }

        temp = null;

        return el;
    },

    /**
     * Insert an element in another.
     *
     * @param  {HTMLElement}        element
     * @param  {HTMLElement}        target
     * @param  {undefined|integer}  position
     */
    insertElement: function (element, target, position) {
        if (element.getAttribute('outside-dom')) {
            return;
        }
        var fragment = document.createDocumentFragment();
        fragment.appendChild(element);
        this.insertInPosition(fragment, target, position);
    },

    /**
     * Insert multiple elements in another.
     *
     * @param  {Array}              elements
     * @param  {HTMLElement}        target
     * @param  {undefined|integer}  position
     */
    insertElements: function (elements, target, position) {
        var fragment = document.createDocumentFragment();
        for (var i = 0, len = elements.length; i < len; ++i) {
            if (elements[i].getAttribute('outside-dom')) {
                continue;
            }
            fragment.appendChild(elements[i]);
        }
        this.insertInPosition(fragment, target, position);
    },

    /**
     * Insert element in a given position.
     *
     * @param  {DocumentFragment|HTMLElement} element
     * @param  {HTMLElement}                  target
     * @param  {undefined|integer}            position
     */
    insertInPosition: function (element, target, position) {
        if (position >= 0 && target.childNodes[position] && target.childNodes[position].parentNode) {
            target.insertBefore(element, target.childNodes[position]);
        } else {
            target.appendChild(element);
        }
    },

    /**
     * Insert an element in its last known location.
     *
     * @param  {HTMLElement} element
     */
    putBackElement: function (element) {
        if (null !== element.parentNode || !element.getAttribute('outside-dom')) {
            return;
        }
        for (var i = 0, len = this._locations.length, location; i < len; ++i) {
            if (this._locations[i].element !== element) {
                continue;
            }
            location = this._locations[i];
            // Next sibling still in position, insert element before it
            if (location.next && location.next.parentNode === location.parent) {
                location.parent.insertBefore(element, location.next);
            // Previous sibling still in position, insert element after it
            } else if (location.prev && location.prev.parentNode === location.parent) {
                if (location.prev.nextSibling) {
                    location.parent.insertBefore(element, location.prev.nextSibling);
                } else {
                    location.parent.appendChild(location.element);
                }
            // Parent empty, or position number is too big, just append element in parent
            } else if (0 === location.parent.childNodes.length || location.parent.childNodes.length < location.position) {
                location.parent.appendChild(location.element);
            // Elsewise, use position to insert element
            } else {
                location.parent.insertBefore(element, location.parent.childNodes[location.position]);
            }
            element.removeAttribute('outside-dom');
            this._locations.splice(i, 1);
            break;
        }
    },

    /**
     * Remove an element from its parent node.
     *
     * @param  {HTMLElement} element
     */
    removeElement: function (element) {
        if (!element || null === element.parentNode) {
            return;
        }
        element.parentNode.removeChild(element);
    },

    /**
     * Put an element aside from its parent node.
     *
     * @param  {HTMLElement} element
     */
    putAsideElement: function (element) {
        if (!element || null === element.parentNode) {
            return;
        }
        this._locations.push({
            element: element,
            parent: element.parentNode,
            position: this.getPosition(element),
            prev: element.previousSibling,
            next: element.nextSibling,
        });
        this.removeElement(element);
        element.setAttribute('outside-dom', true);
    },

    /**
     * Get position of an element in its parent node.
     *
     * @param  {HTMLElement} element
     *
     * @return {int|null}
     */
    getPosition: function (element) {
        if (!element || null === element.parentNode) {
            return null;
        }
        var position = 0;
        var child = element;
        while ((child = child.previousSibling) !== null) {
            ++position;
        }

        return position;
    },

    /**
     * Find all elements matching with a given selector in a given container.
     *
     * @param  {string}           selector
     * @param  {HTMLElement|null} target
     *
     * @return {Array}
     */
    find: function (selector, container) {
        var elements = [];
        if (selector.match(/^#+[a-z0-9_-]+$/i)) {
            elements.push(document.getElementById(selector.substr(1)));
        } else {
            container = container || document.documentElement;
            try {
                elements = [].slice.call(container.querySelectorAll(selector));
            } catch (e) {
                elements = [].slice.call(container.querySelectorAll(this._escapeSelector(selector)));
            }
        }

        return elements.filter(function (node) { return null !== node; });
    },

    /**
     * Find first element matching with a given selector in a given container.
     *
     * @param  {string}           selector
     * @param  {HTMLElement|null} container
     *
     * @return {HTMLElement|null}
     */
    first: function (selector, container) {
        var elements = this.find(selector, container);

        return elements.length > 0 ? elements[0] : null;
    },

    /**
     * Check if an element matches a given selector.
     *
     * @param  {string}       selector
     * @param  {HTMLElement}  element
     *
     * @return {Boolean}
     */
    isMatching: function (selector, element) {
        var result = false;
        var match = HTMLElement.prototype.matches || HTMLElement.prototype.matchesSelector || HTMLElement.prototype.msMatchesSelector || HTMLElement.prototype.mozMatchesSelector || HTMLElement.prototype.webkitMatchesSelector || HTMLElement.prototype.oMatchesSelector || null;
        if (match) {
            try {
                result = match.call(element, selector);
            } catch (e) {
                result = match.call(element, this._escapeSelector(selector));
            }
        }

        return result;
    },

    /**
     * Turn a form into an object.
     *
     * @param  {HTMLElement} form
     *
     * @return {object}
     *
     * @link  https://code.google.com/archive/p/form-serialize/downloads
     */
    formToObject: function (form) {
        if (!form || 'FORM' !== form.nodeName) {
            return {};
        }
        var i;
        var j;
        var data = {};
        for (i = form.elements.length - 1; i >= 0; --i) {
            if ('' === form.elements[i].name) {
                continue;
            }
            switch (form.elements[i].nodeName) {
                case 'INPUT':
                    switch (form.elements[i].type) {
                        case 'text':
                        case 'hidden':
                        case 'password':
                        case 'button':
                        case 'reset':
                        case 'submit':
                        case 'file':
                            data[form.elements[i].name] = form.elements[i].value;
                            break;
                        case 'checkbox':
                        case 'radio':
                            if (form.elements[i].checked) {
                                data[form.elements[i].name] = form.elements[i].value;
                            }
                            break;
                    }
                    break;
                case 'TEXTAREA':
                    data[form.elements[i].name] = form.elements[i].value;
                    break;
                case 'SELECT':
                    switch (form.elements[i].type) {
                        case 'select-one':
                            data[form.elements[i].name] = form.elements[i].value;
                            break;
                        case 'select-multiple':
                            for (j = form.elements[i].options.length - 1; j >= 0; --j) {
                                data[form.elements[i].name] = [];
                                if (form.elements[i].options[j].selected) {
                                    data[form.elements[i].name].push(form.elements[i].options[j].value);
                                }
                            }
                            break;
                    }
                    break;
                case 'BUTTON':
                    switch (form.elements[i].type) {
                        case 'reset':
                        case 'submit':
                        case 'button':
                            data[form.elements[i].name] = form.elements[i].value;
                            break;
                    }
                    break;
            }
        }

        return data;
    },
};

module.exports = new DOMManipulator();


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/**
 * Routes is a service for dealing with routes.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var Router = function () {
    this._routes = {};

    return this;
};

Router.prototype = {

    _routes: null,

    /**
     * Register a new route.
     *
     * @param  {Route} route
     *
     * @return {Router}
     */
    register: function (route) {
        var name = route.getName();
        if (this._routes[name]) {
            throw new Error('A route with name "'+name+'" is already registered.');
        }
        this._routes[name] = route;

        return this;
    },

    /**
     * Find a route matching a given url and method.
     *
     * @param  {string} url
     * @param  {string} method
     *
     * @return {Route|null}
     */
    findRoute: function (url, method) {
        for (var name in this._routes) {
            if (this._routes[name].match(url, method)) {
                return this._routes[name];
            }
        }

        return null;
    },

    /**
     * Generate url for a given route name and parameters.
     *
     * @param  {string}  name
     * @param  {object}  params
     * @param  {boolean} withHost
     *
     * @return {string}
     */
    generateUrl: function (name, params, withHost) {
        if (!this._routes[name]) {
            throw new Error('Try to generate an url for a route named "'+name+'" that is not registered.');
        }

        return this._routes[name].generateUrlWithParams(params, withHost);
    }
};

module.exports = new Router();


/***/ }),
/* 2 */
/***/ (function(module, exports) {

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


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// Requirements
var Collection = __webpack_require__(10);
var EventSystem = __webpack_require__(6);
var accessor = __webpack_require__(2);

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


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Redirect is a function allowing to redirect to a controller action by giving an url.
 *
 * @param {string}  url
 * @param {boolean} inHistory
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var redirect = function (url, storeInHistory) {
    var pages = __webpack_require__(11);
    var btn = document.createElement('a');
    btn.href = url;

    return pages.delegate({ preventDefault: function () {}, target: btn }, storeInHistory);
};

module.exports = redirect;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// Requirements
var EventSystem = __webpack_require__(6);
var es = new EventSystem();

/**
 * Channel is an event publish/subscribe service used by app components and outer scripts.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var channel = {

    /**
     * Subscribe to a new app event.
     *
     * @param  {string}   event
     * @param  {Function} callback
     */
    on: function (event, callback) {
        es.on(event, 'app', callback);
    },

    /**
     * Unsubscribe to an app event.
     *
     * @param  {string}   event
     * @param  {Function} callback
     */
    off: function (event, callback) {
        es.off(event, 'app', callback);
    },

    /**
     * Trigger an app event.
     *
     * @param  {string} event
     */
    trigger: function (event) {
        var args = Array.prototype.slice.call(arguments, 1);
        args.unshift(event, 'app');
        if (false === es.trigger.apply(es, args)) {
            return false;
        }

        return true;
    }
};

module.exports = channel;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

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


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

// Requirements
var EventService = __webpack_require__(8);

/**
 * Events is an instance of EventService, giving an api for dealing with dom events.
 *
 * @return {EventService}
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var events = new EventService();

module.exports = events;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

// Requirements
var DOMManipulator = __webpack_require__(0);

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


/***/ }),
/* 9 */
/***/ (function(module, exports) {

/**
 * Client offers an api to perform ajax request.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var Client = function () {
    this._cache = {};

    return this;
};

Client.prototype = {

    /**
     * Cache storage.
     * @type {Object}
     */
    _cache: null,

    /**
     * Build config from given parameters.
     *
     * @param  {string} url
     * @param  {string} method
     * @param  {object} data
     * @param  {object} config
     *
     * @return {object}
     */
    _buildConfig: function (url, method, data, config) {
        config = config || {};
        config.method = method;
        config.url = url;
        config.data = data;

        return config;
    },

    /**
     * Initialize config values.
     *
     * @param  {object} config
     *
     * @return {object}
     */
    _initConfig: function (config) {
        if (!config.url) {
            throw new Error('No url provided.');
        }
        config.method = config.method || 'GET';
        if (['GET', 'POST', 'PUT', 'DELETE'].indexOf(config.method) === -1) {
            throw new Error('Only methods GET, PUT, POST, DELETE are allowed.');
        }
        if ('GET' === config.method && config.data) {
            var query = [];
            for (var key in config.data) {
                query.push(encodeURIComponent(key)+'='+encodeURIComponent(config.data[key]));
            }
            query = query.join('&');
            config.url += (config.url.indexOf('?') === -1 ? '?' : '&')+query;
            config.data = null;
        } else if ('POST' === config.method || 'PUT' === config.method) {
            if ('JSON' === config.dataType) {
                config.data = JSON.stringify(config.data);
            } else {
                var formData = new FormData();
                for (var name in config.data) {
                    formData.append(name, config.data[name]);
                }
                config.data = formData;
            }
        }
        config.format = config.format || null;
        config.headers = config.headers || {};
        config.async = config.async !== false ? true : false;
        config.cors = config.cors === true ? true : false;
        config.cache = config.cache === true ? true : false;
        config.success = config.success || function () {};
        config.error = config.error || function () {};
        config.always = config.always || function () {};
        config.progress = config.progress || function () {};
        config.timeout = config.timeout || function () {};

        return config;
    },

    /**
     * Build object containing method for running callbacks.
     *
     * @param  {object} config
     * @param  {object} req
     *
     * @return {object}
     */
    _buildPublicApi: function (config, req) {
        return {
            success: function (callback) {
                config.success = callback;
                return this;
            },
            error: function (callback) {
                config.error = callback;
                return this;
            },
            always: function (callback) {
                config.always = callback;
                return this;
            },
            abort: function () {
                req.abort();
                return this;
            }
        };
    },

    /**
     * Handle request error.
     *
     * @param  {object} config
     * @param  {object} req
     * @param  {object} response
     *
     * @return {void}
     */
    _handleError: function (config, req, response) {
        if (config.error) {
            config.error.call(config, response, req.status);
            config.error = null;
            config.always.call(config);
        }
    },

    /**
     * Handle server response.
     *
     * @param  {object} config
     * @param  {object} req
     *
     * @return {object}
     */
    _handleResponse: function (config, req) {
        var response = this._parseResponse(config, req.responseText);
        if (req.status >= 200 && req.status < 400) {
            if (config.cache && 'GET' === config.method) {
                this._cache[config.url] = req.responseText;
            }
            config.success.call(config, response, req.status);
            config.always.call(config);
        } else {
            this._handleError(config, req, response);
        }

        return response;
    },

    /**
     * Parse response to expected format.
     *
     * @param  {object} config
     * @param  {object} responseText
     *
     * @return {mixed}
     */
    _parseResponse: function (config, responseText) {
        if ('JSON' === config.format) {
            return JSON.parse(responseText);
        }

        return responseText;
    },

    /**
     * Send an ajax request.
     *
     * @param  {object} config
     *
     * @return {object}
     */
    call: function (config) {

        // Build config
        config = this._initConfig(config);

        var self = this;
        var req;

        // Return cache response if there is one
        if ('GET' === config.method && this._cache[config.url] && false !== config.cache) {
            req = { responseText: this._cache[config.url], status: 200 };
            if (!config.async) {
                return this._handleResponse(config, req);
            } else {
                setTimeout(function () {
                    self._handleResponse(config, req);
                }, 1);
                return this._buildPublicApi(config, req);
            }
        }

        // Build request object
        req = new(XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
        if (config.cors) {
            if ('withCredentials' in req) {
                // Do nothing
            } else if ('undefined' === typeof XDomainRequest) {
                req = new XDomainRequest();
            } else {
                throw new Error('Your browser does not support CORS request.');
            }
        }

        // Open it
        req.open(config.method, config.url, config.async);

        // Set headers
        if (req.setRequestHeader) {
            // Set default headers
            req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            if (('POST' === config.method || 'PUT' === config.method) && 'JSON' === config.dataType) {
                req.setRequestHeader('Content-Type', 'application/json');
            }
            // Include those given in config
            for (var key in config.headers) {
                req.setRequestHeader(key, config.headers[key]);
            }
        }

        // Not async call
        if (!config.async) {
            req.send(config.data);
            return this._handleResponse(config, req);
        }

        // Async call. Set up events
        if (req.onprogress && config.onprogress) {
            req.onprogress = function () {
                if (req.lengthComputable) {
                    var percentComplete = req.loaded / req.total;
                    config.progress(percentComplete);
                }
            };
        }
        if (req.ontimeout && config.ontimeout) {
            req.ontimeout = config.timeout;
        }
        req.onreadystatechange = function () {
            if (req.readyState > 3) {
                self._handleResponse(config, req);
            }
        };
        req.onerror = function () {
            self._handleResponse(config, req);
        };

        // Send request
        setTimeout(function () {
            req.send(config.data);
        }, 0);

        return this._buildPublicApi(config, req);
    },

    /**
     * Send a GET request.
     *
     * @param  {string} url
     * @param  {object} data
     * @param  {object} config
     *
     * @return {object}
     */
    get: function (url, data, config) {
        return this.call(this._buildConfig(url, 'GET', data, config));
    },

    /**
     * Send a POST request.
     *
     * @param  {string} url
     * @param  {object} data
     * @param  {object} config
     *
     * @return {object}
     */
    post: function (url, data, config) {
        return this.call(this._buildConfig(url, 'POST', data, config));
    },

    /**
     * Send a PUT request.
     *
     * @param  {string} url
     * @param  {object} data
     * @param  {object} config
     *
     * @return {object}
     */
    put: function (url, data, config) {
        return this.call(this._buildConfig(url, 'PUT', data, config));
    },

    /**
     * Send a DELETE request.
     *
     * @param  {string} url
     * @param  {object} data
     * @param  {object} config
     *
     * @return {object}
     */
    delete: function (url, data, config) {
        return this.call(this._buildConfig(url, 'DELETE', data, config));
    }
};

module.exports = new Client();


/***/ }),
/* 10 */
/***/ (function(module, exports) {

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

// Defining setters from Array prototype
// Adding changes handler.
var setters = {
    'pop': 'remove', 'push': 'add', 'reverse': 'change', 'shift': 'remove',
    'sort': 'change', 'splice': 'remove', 'unshift': 'add'
};
for (var method in setters) {
    (function (method) {
        Collection.prototype[method] = function () {
            var event = setters[method];
            var returnValue = arrayProto[method].apply(this, arguments);
            var change;
            if ('remove' === event || 'change' === event) {
                change = returnValue;
            } else if ('add' === event) {
                change = arguments[1] ? arrayProto.slice.call(arguments) : arguments[0];
            }
            this._handler(event, change);

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


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

// Requirements
var Page = __webpack_require__(17);
var Request = __webpack_require__(23);
var innerEvents = __webpack_require__(12);
var router = __webpack_require__(1);
var redirect = __webpack_require__(4);
var channel = __webpack_require__(5);

/**
 * Pages is a container for Page instances.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var pages = new function () {

    var storage = {};

    /**
     * Add a page in the app.
     *
     * @param {string} name
     * @param {object} config
     *
     * @return {self}
     */
    this.add = function (name, config) {
        if (undefined !== storage[name]) {
            throw new Error('A page with the name "'+name+'" is already defined.');
        }
        config.name = name;
        storage[name] = new Page(config);

        return this;
    };

    /**
     * Get a page from the app.
     *
     * @param  {string} name
     *
     * @return {Page}
     */
    this.get = function (name) {
        if (undefined === storage[name]) {
            throw new Error('No page with the name "'+name+'" could be found.');
        }

        return storage[name];
    };

    /**
     * Request delegation.
     * Try to find a page, and run it if found.
     *
     * @param  {object} event
     * @param  {boolean|undefined} storeInHistory
     *
     * @return {boolean}
     */
    this.delegate = function (event, storeInHistory) {
        if (!event) {
            return;
        }
        // Prevent execution if event target has a "data-no-follow" attribute
        var target = event.target;
        if (target.getAttribute('data-no-follow')) {
            return;
        }
        // Prevent default behaviour when clicking on a link having href="#"
        var tagName = target.tagName.toUpperCase();
        var url = 'FORM' === tagName ? target.action : target.href;
        if (/#$/.test(url)) {
            event.preventDefault();
            return;
        }
        // Try finding a route
        var method = 'FORM' === tagName ? target.method.toUpperCase() : 'GET';
        var route = router.findRoute(url, method);
        if (!route) {
            // INNER APP EVENT - No route has been found
            channel.trigger('route.not_found', new Request({ event: event }));
            return;
        }
        var request = new Request({ event: event, route: route });
        // INNER APP EVENT - Route found
        if (false === channel.trigger('route.found', request)) {
            return;
        }
        var page = storage[route.getScheme()];
        if (!page) {
            return;
        }
        // INNER APP EVENT - Page about to be run
        if (false === channel.trigger('page.pre_run', request)) {
            return;
        }
        // Run the page
        event.preventDefault();
        storeInHistory = undefined === storeInHistory ? true : false;
        page.run(request, storeInHistory);
        // INNER APP EVENT - Page has been run
        channel.trigger('page.post_run', request);

        return false;
    };

    innerEvents
        .on('click', '[href]', this.delegate)
        .on('submit', 'form', this.delegate)
        .on('load', window, function () {
            redirect(window.location.href, false);
        })
    ;
};

module.exports = pages;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

// Requirements
var EventService = __webpack_require__(8);

/**
 * InnerEvents is an instance of EventService used only by app components, giving an api for dealing with dom events.
 *
 * @return {EventService}
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var innerEvents = new EventService();

module.exports = innerEvents;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

// Requirements
var View = __webpack_require__(20);

/**
 * Views is a container for View instances.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var views = new function () {

    var storage = {};
    var currentView = null;

    /**
     * Add a view in the app.
     *
     * @param {string} name
     * @param {object} config
     *
     * @return {View}
     */
    this.add = function (name, config) {
        if (undefined !== storage[name]) {
            throw new Error('A view with the name "'+name+'" is already defined.');
        }
        storage[name] = new View(config);

        return storage[name];
    };

    /**
     * Get a view from the app.
     *
     * @param  {string} name
     *
     * @return {View}
     */
    this.get = function (name) {
        if (undefined === storage[name]) {
            throw new Error('No view with the name "'+name+'" could be found.');
        }

        return storage[name];
    };

    /**
     * Render a view from the app.
     *
     * @param  {string}  name
     * @param  {boolean} detached  defines if rendering is detached from auto-revocation
     */
    this.render = function (name, detached) {
        if (undefined === storage[name]) {
            throw new Error('No view with the name "'+name+'" could be found.');
        }
        if (true !== detached) {
            if (currentView && currentView !== storage[name]) {
                currentView.revoke();
            }
            currentView = storage[name];
        }
        storage[name].render();
    };

    /**
     * Revoke a view from the app.
     *
     * @param  {string} name
     */
    this.revoke = function (name) {
        if (undefined === storage[name]) {
            throw new Error('No view with the name "'+name+'" could be found.');
        }
        if (currentView === storage[name]) {
            currentView = undefined;
        }
        storage[name].revoke();
    };
};

module.exports = views;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * This is the main file building the nucleon app object.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
module.exports = {
    channel: __webpack_require__(5),
    events: __webpack_require__(7),
    http: __webpack_require__(9),
    memory: __webpack_require__(15),
    models: __webpack_require__(16),
    pages: __webpack_require__(11),
    views: __webpack_require__(13),
    redirect: __webpack_require__(4),
    router: __webpack_require__(1),
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

// Requirements
var accessor = __webpack_require__(2);

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


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

// Requirements
var Model = __webpack_require__(3);

/**
 * Models is a container for Model instances.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var models = new function () {

    var storage = {};

    /**
     * Add a model in the app.
     *
     * @param {string} name
     * @param {object} config
     *
     * @return {Model}
     */
    this.add = function (name, config) {
        if (undefined !== storage[name]) {
            throw new Error('A model with the name "'+name+'" is already defined.');
        }
        storage[name] = new Model(config);

        return storage[name];
    };

    /**
     * Get a model from the app.
     *
     * @param  {string} name
     *
     * @return {Model}
     */
    this.get = function (name) {
        if (undefined === storage[name]) {
            throw new Error('No model with the name "'+name+'" could be found.');
        }

        return storage[name];
    };
};

module.exports = models;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

// Requirements
var Route = __webpack_require__(18);
var router = __webpack_require__(1);
var history = __webpack_require__(19);
var views = __webpack_require__(13);

/**
 * Page is an object in charge of rendering a view for all requests on a given route.
 *
 * @constructor
 * @param {object} config
 * @return {Page}
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var Page = function (config) {
    return this._build(config);
};

Page.prototype = {

    _fn: null,
    _name: null,
    _route: null,
    _view: null,

    _build: function (config) {
        if (!config.name) {
            throw new Error('Page "'+config.name+'" must have a name.');
        }
        this._name = config.name;

        if (!config.fn) {
            throw new Error('Page "'+config.name+'" must have a function.');
        }
        if ('function' !== typeof config.fn) {
            throw new Error('"fn" declared in page "'+config.name+'" is not a function.');
        }
        this._fn = config.fn;

        if (!config.route) {
            throw new Error('Page "'+config.name+'" must have a route.');
        }
        if ('string' === typeof config.route) {
            config.route = {
                path: config.route,
                method: 'GET'
            };
        }
        config.route.scheme = config.name;
        config.route.name = config.route.name ? config.route.name : config.name;
        this._route = new Route(config.route);
        router.register(this._route);

        if (config.view) {
            this._view = views.add(this._name+'_view', config.view);
        }

        return this;
    },

    /**
     * Get inner page view context.
     */
    getViewContext: function () {
        if (!this._view) {
            throw new Error(this._name+' page has no inner view. getViewContext() can not be called.');
        }
        return this._view._context;
    },

    /**
     * Render inner page view.
     *
     * @param  {boolean} detached  defines if rendering is detached from auto-revocation
     */
    renderView: function (detached) {
        if (!this._view) {
            throw new Error(this._name+' page has no inner view. renderView() can not be called.');
        }
        views.render(this._name+'_view', detached);
    },

    /**
     * Run page treatment.
     */
    run: function (request, storeInHistory) {
        if (false !== storeInHistory) {
            var self = this;
            history.addEntry(request.getUrl(), function() {
                self._fn.call(self, request);
            });
        }

        this._fn.call(this, request);
    }
};

module.exports = Page;


/***/ }),
/* 18 */
/***/ (function(module, exports) {

/**
 * Route is an object checking if a url match with a certain pattern and method.
 *
 * @constructor
 * @param {object} config
 * @return {Route}
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var Route = function  (config) {
    this._params = {};

    return this._build(config);
};

Route.prototype = {

    _path: null,
    _pattern: null,
    _params: null,
    _method: null,
    _name: null,
    _scheme: null,

    _build: function (config) {
        this._setMethod(config.method || 'GET');
        if (config.params) {
            this._setParams(config.params);
        }
        if (config.path) {
            this._setPath(config.path);
        } else {
            throw new Error('Path must be defined.');
        }
        if (config.name) {
            this._name = config.name;
        } else {
            throw new Error('Name must be defined.');
        }
        if (config.scheme) {
            this._scheme = config.scheme;
        }

        return this;
    },

    _setMethod: function (method) {
        method = method.toUpperCase();
        if ('GET' !== method && 'POST' !== method && 'GET|POST' !== method && 'POST|GET' !== method) {
            throw new Error('Method is not supported. "GET", "POST", "GET|POST" only.');
        }
        this._method = new RegExp(method);

        return this;
    },

    _setParams: function (params) {
        if (false === params instanceof Object) {
            throw new Error('Params must be an object.');
        }
        // Handle shortcuts
        for (var name in params) {
            if ('number' === params[name]) {
                params[name] = '[0-9]+';
            } else if ('word' === params[name]) {
                params[name] = '[a-zA-Z0-9%]+';
            } else if ('slug' === params[name]) {
                params[name] = '[a-zA-Z0-9_-]+';
            }
        }
        this._params = params;

        return this;
    },

    _setPath: function (path) {
        this._path = path;
        this._setPattern(path);

        return this;
    },

    _setPattern: function (path) {
        this._pattern = path;
        var marker;
        for (var name in this._params) {
            marker = '{'+name+'}';
            if (-1 === this._pattern.indexOf(marker)) {
                throw new Error('Parameter "'+name+'" is not in route path "'+path+'".');
            }
            this._pattern = this._pattern.replace(marker, this._params[name]);
        }
        if (-1 === this._pattern.indexOf(window.location.host)) {
            this._pattern = window.location.host+this._pattern;
        }
        this._pattern += '$';
        this._pattern = new RegExp(this._pattern);

        return this;
    },

    /**
     * Check if route match with a given url and method.
     *
     * @param  {string} url
     * @param  {string} method
     *
     * @return {boolean}
     */
    match: function (url, method) {
        url = url.split('?')[0];
        return this._pattern.test(url) && this._method.test(method);
    },

    /**
     * Extract parameters values from a given url.
     *
     * @param  {string} url
     *
     * @return {object}
     */
    extractParamsFromUrl: function (url) {
        var capturingPattern;
        var params = {};
        var nameRepeat;
        var match;
        for (var name in this._params) {
            capturingPattern = this._path;
            for (nameRepeat in this._params) {
                capturingPattern = capturingPattern.replace('{'+nameRepeat+'}', (name === nameRepeat ? '('+this._params[nameRepeat]+')' : this._params[nameRepeat]));
            }
            if ((match = new RegExp(capturingPattern).exec(url))) {
                params[name] = decodeURI(match[1]);
            }
        }

        return params;
    },

    /**
     * Generate an url with given parameters.
     *
     * @param  {object} params
     * @param  {boolean} withHost
     *
     * @return {string}
     */
    generateUrlWithParams: function (params, withHost) {
        var url = this._path;
        var queryParams = [];
        var marker;
        for (var name in params) {
            marker = '{'+name+'}';
            if (-1 !== url.indexOf(marker)) {
                if (new RegExp(this._params[name]).test(params[name])) {
                    url = url.replace(marker, params[name]);
                } else {
                    throw new Error('Invalid parameter "'+name+'" for route path "'+this._path+'". Must match "'+this._params[name]+'".');
                }
            } else {
                queryParams.push(encodeURI(name)+'='+encodeURI(params[name]));
            }
        }
        if (queryParams.length > 0) {
            url += (-1 === url.indexOf('?') ? '?' : '&')+queryParams.join('&');
        }
        if (true === withHost) {
            url = window.location.protocol+'//'+window.location.host+url;
        }

        return url;
    },

    /**
     * Get route name.
     *
     * @return {string}
     */
    getName: function () {
        return this._name;
    },

    /**
     * Get route scheme.
     *
     * @return {string}
     */
    getScheme: function () {
        return this._scheme;
    }
};

module.exports = Route;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

// Requirements
var innerEvents = __webpack_require__(12);
var redirect = __webpack_require__(4);

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


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

// Requirements
var client = __webpack_require__(9);
var DOMManipulator = __webpack_require__(0);
var Fusioner = __webpack_require__(21);
var Model = __webpack_require__(3);
var router = __webpack_require__(1);

/**
 * View instances give an api for rendering an element based on a given template and context.
 *
 * @constructor
 * @param {object} config
 * @return {View}
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var View = function (config) {
    this._buildConfig(config);

    return this;
};

View.prototype = {

    // Init vars
    _root: null,
    _template: null,
    _templateUrl: null,
    _context: null,
    // Event callbacks
    _onMounted: null,
    _onRender: null,
    _onRendered: null,
    _onUpdate: null,
    _onUpdated: null,
    _onRevoke: null,
    _onRevoked: null,
    // Inner vars
    _fusioner: null,
    _rendered: false,

    _buildConfig: function (config) {
        for (var prop in config) {
            if (null === this['_'+prop]) {
                if ('context' === prop) {
                    this['_'+prop] = this._buildContext(config[prop]);
                } else {
                    this['_'+prop] = config[prop];
                }
            } else {
                this[prop] = config[prop];
            }
        }
        if (!this._root) {
            throw new Error('Root must be defined to construct a view.');
        }
        if (!this._context) {
            this._context = this._buildContext({});
        }
    },

    _buildContext: function (context) {
        var prop;
        var _context = {};
        for (prop in context) {
            if (false === context[prop] instanceof Model) {
                _context[prop] = context[prop];
                delete context[prop];
            }
        }
        _context = new Model(_context);
        for (prop in context) {
            _context[prop] = context[prop];
        }
        // Adding routing method in context
        _context.generateUrl = function (routeName, params, withHost) {
            return router.generateUrl(routeName, params, withHost);
        };

        return _context;
    },

    _getRoot: function () {
        if ('string' === typeof this._root) {
            var root = DOMManipulator.first(this._root);
            if (!root) {
                throw new Error('Root element with selector "'+this._root+'" could not been found.');
            }
            this._root = root;
        }

        return this._root;
    },

    /**
     * Insert view elements in the DOM.
     */
    render: function () {

        var self = this;

        // Template is not loaded
        if (!this._template && this._templateUrl) {
            // Try to download it synchronously if url provided
            client.get(this._templateUrl, { t_ref: new Date().getTime() }, {
                async: false,
                success: function (template) {
                    self._template = template;
                },
                error: function () {
                    throw new Error('Template located in "'+self._templateUrl+'" could not be loaded.');
                }
            });
        } else if (!this._template && !this._templateUrl) {
            // Elsewise, use root instead
            this._template = [this._getRoot()];
        }

        // Template is still a string value
        if ('string' === typeof this._template) {
            // Create html elements from string
            this._template = DOMManipulator.createElement(this._template);
            var elements = [];
            if (this._template instanceof HTMLElement) {
                elements.push(this._template);
            } else if (this._template instanceof DocumentFragment) {
                while (this._template.firstChild) {
                    elements.push(this._template.removeChild(this._template.firstChild));
                }
            }
            this._template = elements;
        }

        // Bind context to template if not done yet
        if (!this._fusioner) {
            var fusionerConfig = {
                element: this._template,
                context: this._context,
                shouldApply: function () {
                    return self._rendered;
                }
            };
            // Call onUpdate callback
            if ('function' === typeof self._onUpdate) {
                fusionerConfig.onUpdate = function () {
                    self._onUpdate();
                };
            }
            // Call onUpdated callback
            if ('function' === typeof self._onUpdated) {
                fusionerConfig.onUpdated = function () {
                    self._onUpdated();
                };
            }
            this._fusioner = new Fusioner(fusionerConfig);
        }

        // Template is not rendered
        if (!this._rendered) {
            // Call onRender callback
            if ('function' === typeof this._onRender) {
                this._onRender();
            }
            // Insert elements
            var root = this._getRoot();
            if (this._template[0] !== root) {
                DOMManipulator.insertElements(this._template, root);
            } else {
                DOMManipulator.putBackElement(root);
            }
            this._rendered = true;
            // Call onRendered callback
            if ('function' === typeof this._onRendered) {
                this._onRendered();
            }
            this._fusioner.applyChanges();
        }
    },

    /**
     * Remove view elements from the DOM.
     */
    revoke: function () {
        if (this._rendered) {
            // Call onRevoke callback
            if ('function' === typeof this._onRevoke) {
                this._onRevoke();
            }
            var root = this._getRoot();
            if (this._template[0] !== root) {
                // Remove each elements
                for (var i = 0, len = this._template.length; i < len; ++i) {
                    DOMManipulator.removeElement(this._template[i]);
                }
            } else {
                DOMManipulator.putAsideElement(root);
            }
            this._rendered = false;
            // Call onRevoked callback
            if ('function' === typeof this._onRevoked) {
                this._onRevoked();
            }
        }
    },

    /**
     * Get the view execution context
     *
     * @return {null|Model}
     */
    getContext: function () {
        return this._context;
    },
};

module.exports = View;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

// Requirements
var accessor = __webpack_require__(2);
var DOMManipulator = __webpack_require__(0);
var events = __webpack_require__(7);
var processor = __webpack_require__(22);
var Model = __webpack_require__(3);
var Collection = __webpack_require__(10);

/**
 * Fusioner instances create a binding between an html element and a context.
 *
 * @constructor
 * @param {object} config
 * @return {Fusioner}
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var Fusioner = function (config) {
    this._init = [];
    this._waiting = [];
    this._events = {};
    if (false === config.element instanceof Array) {
        config.element = [config.element];
    }
    this._element = config.element;
    this._context = config.context;
    this._shouldApply = config.shouldApply;
    this._onUpdate = config.onUpdate;
    this._onUpdated = config.onUpdated;
    for (var i = 0, len = this._element.length; i < len; ++i) {
        this._bind(this._element[i]);
    }

    return this;
};

Fusioner.prototype = {

    _element: null,
    _context: null,
    _shouldApply: null,
    _init: null,
    _waiting: null,
    _events: null,

    _extractMarkers: function (string) {
        if (string) {
            var MARKERS = /\{\{((?!\{\{|\}\}).)*\}\}/g;
            var DELIMITERS = /\{\{|\}\}/g;
            var markers = string.match(MARKERS);
            if (markers && markers.length > 0) {
                markers = markers.map(function (marker) {
                    return {
                        outer: marker,
                        inner: marker.replace(DELIMITERS, '').trim()
                    };
                });
                return markers.length > 0 ? markers : [];
            }
        }
        return [];
    },

    _extractContextProperties: function (string) {
        var props = [];
        var portions = string.split(/[ |(|)|{|}|[|]|,|:|\+|"|']/g); // TODO - Pourquoi avoir mis |"|', les valeurs entres guillements ne sont pas des références au context
        for (var i = 0, len = portions.length, fragments, model; i < len; ++i) {
            fragments = portions[i].split('.');
            model = fragments.shift();
            if (undefined !== this._context[model]) {
                if (false === this._context[model] instanceof Model) {
                    fragments.unshift(model);
                    model = null;
                }
                props.push({ model: model, path: fragments.join('.').replace('.length', '') });
            }
        }

        return props;
    },

    _replaceAliases: function (string, aliases) {
        if (aliases) {
            for (var alias in aliases) {
                if (alias === string) {
                    string = aliases[alias];
                } else {
                    var pattern = '([(|)|,|+|-|*|/])?(\\b'+ alias +'\\b)+([(|)|,|+|-|*|/])?';
                    string = string.replace(new RegExp(pattern, 'g'), function (match, $1, $2, $3) {
                        return ($1 ? $1 : '') + aliases[alias] + ($3 ? $3 : '');
                    });
                }
            }
        }

        return string;
    },

    _replaceAliasesInElement: function (element, aliases) {
        var i;
        var len;
        // HTMLElement
        if (1 === element.nodeType) {
            if (element.getAttribute('data-no-bind')) {
                return;
            }
            if (element.attributes) {
                for (i = 0, len = element.attributes.length; i < len; ++i) {
                    element.setAttribute(element.attributes[i].name, this._replaceAliases(element.attributes[i].value, aliases));
                }
            }
        // Text node
        } else if (3 === element.nodeType) {
            var contentProp = element.textContent ? 'textContent' : 'nodeValue'; // IE8 polyfill
            element[contentProp] = this._replaceAliases(element[contentProp], aliases);
        }
        // Recursive binding
        if (element.childNodes && element.childNodes.length > 0) {
            for (i = 0, len = element.childNodes.length; i < len; ++i) {
                this._replaceAliasesInElement(element.childNodes[i], aliases);
            }
        }

        return element;
    },

    _evaluateText: function (expr) {
        var result = processor.process(expr, this._context);

        return !result && 0 !== result ? '' : result;
    },

    _getPropPath: function (prop) {
        return (prop.model ? prop.model+'.' : '')+prop.path;
    },

    _on: function (event, prop, callback) {
        var propPath = this._getPropPath(prop);
        var eventPath = propPath+':'+event;
        // Register a unique event listener in model for prop
        if (!this._events[eventPath]) {
            this._events[eventPath] = [];
            var target = prop.model ? this._context[prop.model] : this._context;
            var self = this;
            target.on(event, prop.path, function (newValue) {
                self._dispatch(event, prop, newValue);
            });
            // Add extra listeners if prop refers to a collection
            if (accessor.getPropertyValue(this._context, propPath) instanceof Collection) {
                target.on('add', prop.path, function (added) {
                    self._dispatch(event, prop, added);
                });
                target.on('remove', prop.path, function (removed) {
                    self._dispatch(event, prop, removed);
                });
            }
        }
        this._events[eventPath].push(callback);
    },

    _trigger: function (event, prop, newValue) {
        var target = prop.model ? this._context[prop.model] : this._context;
        target.trigger(event, prop.path, newValue);
    },

    _dispatch: function (event, prop, newValue) {
        var eventPath = this._getPropPath(prop)+':'+event;
        if (this._events[eventPath].length > 0) {
            var i;
            var len;
            // Dispatch event through all callbacks if changes should be applied
            if (false !== this._shouldApply()) {
                // Call onUpdate callback
                if ('function' === typeof this._onUpdate) {
                    this._onUpdate();
                }
                for (i = 0, len = this._events[eventPath].length; i < len; ++i) {
                    this._events[eventPath][i](newValue);
                }
                // Call onUpdated callback
                if ('function' === typeof this._onUpdated) {
                    this._onUpdated();
                }
            // Elsewise, store them in a queue
            } else {
                for (i = 0, len = this._events[eventPath].length; i < len; ++i) {
                    this._waiting.push(this._events[eventPath][i]);
                }
            }
        }
    },

    _bind: function (element, aliases) {

        if (!element) {
            return;
        }

        var self = this;
        var attr;
        var prop;
        var propPath;
        var eventName;
        var i;
        var len;
        var name;
        var content;
        var markers;

        // HTMLElement
        if (1 === element.nodeType) {

            if (element.getAttribute('data-no-bind')) {
                return;
            }

            // Loop
            if ((attr = element.getAttribute('data-for'))) {

                // Set up base values
                aliases = aliases || {};
                var alias = attr.replace(/in .*/, '').trim();
                var key = null;
                if (alias.indexOf(',') !== -1) {
                    alias = alias.split(',');
                    key = alias[0].trim();
                    alias = alias[1].trim();
                }
                var expr = attr.replace(/.* in/, '').trim();
                var props = this._extractContextProperties(expr, aliases);

                // Save data needed for insertion of loop elements.
                var parent = element.parentNode;
                var position = DOMManipulator.getPosition(element);
                // Put element aside. Will be used as a model for loop elements.
                DOMManipulator.removeElement(element);
                element.removeAttribute('data-for');

                var iterable = processor.process(expr, this._context);
                if (undefined === iterable) {
                    throw new Error(expr+' is an invalid expression for a loop.');
                }
                var nodes = [];

                // For i in collection length
                if (iterable instanceof Collection) {
                    prop = props[0];
                    propPath = this._getPropPath(prop);
                    var oldCollection = [];
                    var handleLoopForCollection = function (newCollection) {
                        newCollection = newCollection || accessor.getPropertyValue(self._context, propPath);
                        var i, j, len, len2;
                        var newNode;
                        var newNodes = [];
                        var newIndexes = [];
                        var changedIndexes = [];
                        var removedIndexes = [];
                        var eventPath;
                        // Nodes operations. Compare old and new collection items
                        for (i = 0, len = newCollection.length; i < len; ++i) {
                            // Same item in old and new collection, do nothing
                            if (oldCollection[i] === newCollection[i]) {
                                continue;
                            }
                            // New item, create a node
                            if (!oldCollection[i]) {
                                newNode = element.cloneNode(true);
                                newNodes.push(newNode);
                                newIndexes.push(i);
                                nodes.push(newNode);
                            // Item changed, save its index for calling an update in listeners operations
                            } else {
                                changedIndexes.push(i);
                            }
                        }
                        if (oldCollection.length > newCollection.length) {
                            // Remove nodes no longer needed
                            for (i = oldCollection.length - 1, len = newCollection.length - 1; i > len; --i) {
                                DOMManipulator.removeElement(nodes[i]);
                                nodes.splice(i, 1);
                                // Save its index for removing listener in listeners operations
                                removedIndexes.push(i);
                            }
                        } else {
                            // Insert and bind new nodes
                            DOMManipulator.insertElements(newNodes, parent, position + (nodes.length - newNodes.length));
                            for (i = 0, len = newIndexes.length; i < len; ++i) {
                                aliases[alias] = propPath+'.'+newIndexes[i];
                                if (key) {
                                    aliases[key] = newIndexes[i]+'';
                                }
                                self._bind(self._replaceAliasesInElement(nodes[newIndexes[i]], aliases), aliases);
                            }
                        }
                        // Listeners operations
                        if (changedIndexes.length || removedIndexes.length) {
                            // TODO - prop.1 matches prop.[10]
                            var changedPropPaths = changedIndexes.length ? new RegExp('^'+propPath+'\\.(?:'+changedIndexes.join('|')+')\\.') : null;
                            var removedPropPaths = removedIndexes.length ? new RegExp('^'+propPath+'\\.(?:'+removedIndexes.join('|')+')\\.') : null;
                            for (eventPath in self._events) {
                                // Remove listeners no longer needed
                                if (removedPropPaths && removedPropPaths.test(eventPath)) {
                                    self._events[eventPath] = [];
                                }
                                // Trigger listeners related to updated nodes
                                if (changedPropPaths && changedPropPaths.test(eventPath)) {
                                    for (j = 0, len2 = self._events[eventPath].length; j < len2; ++j) {
                                        self._events[eventPath][j]();
                                    }
                                }
                            }
                        }
                        oldCollection = newCollection.slice(0);
                    };
                    this._on('change', prop, function () { handleLoopForCollection(); });
                    handleLoopForCollection(iterable);

                // For name in object
                } else if (iterable instanceof Object) {
                    var propNames = [];
                    for (var propName in iterable) {
                        if (!iterable.hasOwnProperty(propName) || typeof iterable[propName] === 'function') {
                            continue;
                        }
                        propNames.push(propName);
                        nodes.push(element.cloneNode(true));
                    }
                    DOMManipulator.insertElements(nodes, parent, position);
                    for (i = 0, len = nodes.length; i < len; ++i) {
                        if (key) {
                            aliases[key] = '"'+propNames[i]+'"';
                            aliases[alias] = expr+'.'+propNames[i];
                        } else {
                            aliases[alias] = '"'+propNames[i]+'"';
                        }
                        self._bind(self._replaceAliasesInElement(nodes[i], aliases), aliases);
                    }

                // For i in number
                } else if ('number' === typeof iterable) {
                    var oldNumber = 0;
                    var handleLoopForNumber = function (number) {
                        number = number || processor.process(expr, self._context);
                        if (number === oldNumber) {
                            return;
                        }
                        var i, len;
                        var newNode;
                        var newNodes = [];
                        if (number > oldNumber) {
                            for (i = oldNumber; i < number; ++i) {
                                newNode = element.cloneNode(true);
                                newNodes.push(newNode);
                                nodes.push(newNode);
                            }
                            DOMManipulator.insertElements(newNodes, parent, position);
                            for (i = 0, len = newNodes.length; i < len; ++i) {
                                aliases[alias] = (oldNumber+i)+'';
                                self._bind(self._replaceAliasesInElement(newNodes[i], aliases), aliases);
                            }
                        } else {
                            for (i = oldNumber; i >= number; --i) {
                                DOMManipulator.removeElement(nodes[i]);
                                nodes.splice(i, 1);
                            }
                        }
                        oldNumber = number;
                    };
                    if (props.length > 0) {
                        for (i = 0, len = props.length; i < len; ++i) {
                            this._on('change', props[i], function () { handleLoopForNumber(); });
                        }
                    }
                    handleLoopForNumber(iterable);
                }

                return;
            }

            // Two-way data binding
            if ((attr = element.getAttribute('data-bind'))) {
                prop = this._extractContextProperties(attr);
                if (0 === prop.length) {
                    throw new Error('Data-bind with value "'+attr+'" refers to a non existing context property.');
                }

                prop = prop[0];
                propPath = this._getPropPath(prop);

                var tagName = element.tagName.toLowerCase();
                var updateValue;
                if ('select' === tagName || ('input' === tagName && ('radio' === element.type || 'checkbox' === element.type))) {
                    // Set up value. Update in case of outer changes
                    updateValue = function (newValue) {
                        newValue = newValue || accessor.getPropertyValue(self._context, propPath);
                        if ('radio' === element.type || 'checkbox' === element.type) {
                            if (newValue === true || newValue === element.value) {
                                element.checked = 'checked';
                            } else {
                                element.checked = '';
                            }
                        } else {
                            element.value = newValue;
                        }
                    };
                    self._init.push(function () {
                        updateValue(accessor.getPropertyValue(self._context, propPath));
                    });
                    this._on('change', prop, updateValue);
                    // Trigger model in case of inner change
                    events.on('change', element, function (e) {
                        var target = e.target || e.srcElement;
                        var value = target.value;
                        if ('radio' === element.type || 'checkbox' === element.type) {
                            if ('checkbox' === target.type && 'on' === value) {
                                value = target.checked ? true : false;
                            } else {
                                value = target.checked ? value : null;
                            }
                        }
                        self._trigger('change', prop, value);
                    });

                } else if ('textarea' === tagName || 'input' === tagName){
                    // Set up value. Update in case of outer changes
                    updateValue = function (newValue) {
                        newValue = newValue || accessor.getPropertyValue(self._context, propPath);
                        element.value = newValue || '';
                    };
                    updateValue(accessor.getPropertyValue(this._context, propPath));
                    this._on('change', prop, updateValue);
                    // Trigger model in case of inner change
                    eventName = 'oninput' in element ? 'input' : 'keyup, keypress';
                    events.on(eventName, element, function (e) {
                        var target = e.target || e.srcElement;
                        self._trigger('change', prop, target.value);
                    });
                }
            }

            // Events
            if ((attr = element.getAttribute('data-events'))) {
                var dataEvents = attr.split(';');
                var components;
                var callback;
                for (i = 0, len = dataEvents.length; i < len; ++i) {
                    components = dataEvents[i].split(':');
                    if (components.length === 2) {
                        eventName = components[0].trim();
                        callback = components[1].trim();
                        events.on(eventName, element, function (e) {
                            self._context.e = e;
                            processor.process(callback, self._context);
                        });
                    }
                }
                element.removeAttribute('data-events');
            }

            // Conditional insertion
            if ((attr = element.getAttribute('data-if'))) {
                (function (attr) {
                    var handleInsertion = function () {
                        var result = processor.process(attr, self._context);
                        if (undefined === result || false === result || null === result || '' === result) {
                            DOMManipulator.putAsideElement(element);
                        } else {
                            DOMManipulator.putBackElement(element);
                        }
                    };
                    // Wait for the element to be inserted before evaluating its insertion
                    if (!element.parentNode) {
                        self._init.push(handleInsertion);
                    } else {
                        handleInsertion();
                    }
                    self._extractContextProperties(attr).forEach(function (prop) {
                        if ('function' !== typeof accessor.getPropertyValue(self._context, self._getPropPath(prop))) {
                            self._on('change', prop, handleInsertion);
                        }
                    });
                }(attr));
                element.removeAttribute('data-if');
            }

            // Conditional displaying
            if ((attr = element.getAttribute('data-show'))) {
                (function (attr) {
                    var handleDisplaying = function () {
                        var result = processor.process(attr, self._context);
                        if (undefined === result || false === result || null === result || '' === result) {
                            element.style.display = 'none';
                        } else {
                            element.style.display = '';
                        }
                    };
                    handleDisplaying();
                    self._extractContextProperties(attr).forEach(function (prop) {
                        if ('function' !== typeof accessor.getPropertyValue(self._context, self._getPropPath(prop))) {
                            self._on('change', prop, handleDisplaying);
                        }
                    });
                }(attr));
                element.removeAttribute('data-show');
            }

            // Left attributes
            if (element.attributes) {
                for (i = 0, len = element.attributes.length; i < len; ++i) {
                    name = element.attributes[i].name;
                    content = element.attributes[i].value;
                    if (content) {
                        markers = self._extractMarkers(content);
                        if (markers.length > 0) {
                            (function (name, content, markers) {
                                var updateAttribute = function () {
                                    var newContent = content;
                                    for (var i = 0, len = markers.length; i < len; ++i) {
                                        newContent = newContent.replace(markers[i].outer, self._evaluateText(markers[i].inner));
                                    }
                                    element.setAttribute(name, newContent);
                                };
                                updateAttribute();
                                markers.forEach(function (marker) {
                                    self._extractContextProperties(marker.inner).forEach(function (prop) {
                                        if ('function' !== typeof accessor.getPropertyValue(self._context, self._getPropPath(prop))) {
                                            self._on('change', prop, updateAttribute);
                                        }
                                    });
                                });
                            }(name, content, markers));
                        }
                    }
                }
            }

        // TextNode
        } else if (3 === element.nodeType) {
            var contentProp = element.textContent ? 'textContent' : 'nodeValue'; // IE8 polyfill
            content = element[contentProp].trim();
            if (content) {
                markers = this._extractMarkers(content);
                if (markers.length > 0) {
                    var updateContent = function () {
                        var newContent = content;
                        for (var i = 0, len = markers.length; i < len; ++i) {
                            newContent = newContent.replace(markers[i].outer, self._evaluateText(markers[i].inner));
                        }
                        element[contentProp] = newContent;
                    };
                    updateContent();
                    for (i = 0, len = markers.length; i < len; ++i) {
                        this._extractContextProperties(markers[i].inner).forEach(function (prop) {
                            if ('function' !== typeof accessor.getPropertyValue(self._context, self._getPropPath(prop))) {
                                self._on('change', prop, updateContent);
                            }
                        });
                    }
                }
            }
        }

        // Recursive binding
        if (element.childNodes && element.childNodes.length > 0) {
            for (i = 0, len = element.childNodes.length; i < len; ++i) {
                this._bind(element.childNodes[i], aliases);
            }
        }

        return element;
    },

    /**
     * Apply all changes waiting to be applied in element.
     */
    applyChanges: function () {
        var i;
        var len;
        if (this._init.length > 0) {
            for (i = 0, len = this._init.length; i < len; ++i) {
                this._init[i]();
            }
            this._init = [];
        }
        if (this._waiting.length > 0) {
            // Call onUpdate callback
            if ('function' === typeof this._onUpdate) {
                this._onUpdate();
            }
            for (i = 0, len = this._waiting.length; i < len; ++i) {
                this._waiting[i]();
            }
            this._waiting = [];
            // Call onUpdated callback
            if ('function' === typeof this._onUpdated) {
                this._onUpdated();
            }
        }
    }
};

module.exports = Fusioner;


/***/ }),
/* 22 */
/***/ (function(module, exports) {

/**
 * ExprEvaluator returns a value for a given string expression and context object.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var ExprEvaluator = function () {

    'use strict';

    // Const
    var ARRAY_START = '[';
    var ARRAY_END = ']';
    var COMMA = ',';
    var DOUBLE_QUOTE = '"';
    var DOUBLE_DOT = ':';
    var ESCAPER = '\\';
    var OBJECT_START = '{';
    var OBJECT_END = '}';
    var PAREN_START = '(';
    var PAREN_END = ')';
    var SINGLE_QUOTE = "'";
    var SPACE = ' ';

    // Private functions
    var symbols = {
        // ===== NOT ops
        '!' : function (idx, ary) { return !ary[idx + 1]; },
        // ===== Mathematical ops
        '*' : function (idx, ary) { return ary[idx - 1] * ary[idx + 1]; },
        '/' : function (idx, ary) { return ary[idx - 1] / ary[idx + 1]; },
        '%' : function (idx, ary) { return ary[idx - 1] % ary[idx + 1]; },
        '-' : function (idx, ary) { return (ary[idx - 1] || 0) - ary[idx + 1]; },
        '+' : function (idx, ary) {
            var a = ary[idx - 1] !== undefined ? ary[idx - 1] : 0;
            if (null === a) {
                a = '';
            }
            var b = ary[idx + 1] !== undefined ? ary[idx + 1] : 0;
            if (null === b) {
                b = '';
            }
            return a + b;
        },
        // ===== Comparison ops
        '!=': function (idx, ary) { return ary[idx - 1] !== ary[idx + 1]; },
        '==': function (idx, ary) { return ary[idx - 1] === ary[idx + 1]; },
        '>' : function (idx, ary) { return ary[idx - 1] >   ary[idx + 1]; },
        '>=': function (idx, ary) { return ary[idx - 1] >=  ary[idx + 1]; },
        '<' : function (idx, ary) { return ary[idx - 1] <   ary[idx + 1]; },
        '<=': function (idx, ary) { return ary[idx - 1] <=  ary[idx + 1]; },
        // ===== Boolean ops
        '&&': function (idx, ary) { return ary[idx - 1] && ary[idx + 1]; },
        '||': function (idx, ary) { return ary[idx - 1] || ary[idx + 1]; },
        // ===== Ternary ops
        '?' : function (idx, ary) {
            var first = ':' === ary[idx + 1] ? '' : ary[idx + 1];
            var second = undefined === ary[idx + 3] ? (':' === ary[idx + 2] ? '' : ary[idx + 2]) : ary[idx + 3];
            return ary[idx - 1] ? first : second;
        }
    };

    // Private vars
    var index;
    var components;
    var inSingleQuote;
    var inDoubleQuote;
    var inEscaper;
    var inSymbol;
    var openObjects;
    var openArrays;
    var symbolsUsed;
    var newRow;
    var evaluate;
    var openIndexes;

    /**
     * Return value for given expression and context.
     *
     * @param  {string} expr
     * @param  {object} context
     *
     * @return {mixed}
     */
    this.process = function (expr, context) {

        index = 0;
        components = [''];
        inSingleQuote = false;
        inDoubleQuote = false;
        inEscaper = false;
        inSymbol = false;
        openObjects = 0;
        openArrays = 0;
        symbolsUsed = {};
        newRow = false;
        evaluate = false;
        openIndexes = [];

        function toggle (value) {
            return true !== value;
        }

        function addOpenIndex (i) {
            openIndexes.push(i);
        }

        function getLastOpenIndex () {
            return openIndexes.pop();
        }

        function inQuotes () {
            return inSingleQuote || inDoubleQuote;
        }

        function isFunction (string) {
            return /^[a-z.]+\(/i.test(string);
        }

        function isSymbol (string) {
            return undefined !== symbols[string];
        }

        function addInRow (k) {
            if (newRow) {
                index++;
                components[index] = '';
                newRow = false;
            }
            components[index] += k;
        }

        function inNewRow (k) {
            prepareNewRow();
            addInRow(k);
        }

        function prepareNewRow () {
            if ('' !== components[index]) {
                newRow = true;
            }
            if (true === evaluate) {
                components[index] = stringToValue(components[index]);
                evaluate = false;
            }
        }

        function accessProperty (path, params) {
            var fragments = path.split('.');
            if (!context || undefined === context[fragments[0]]) {
                return undefined;
            }
            var target = context;
            var owner = target;
            var i;
            var len = fragments.length;
            for (i = 0; i < len; ++i) {
                if (undefined !== target[fragments[i]]) {
                    owner = target;
                    target = target[fragments[i]];
                } else {
                    return undefined;
                }
            }
            if (typeof target === 'function') {
                target = target.apply(owner, params);
            }

            return target;
        }

        function stringToValue (string) {
            switch (string) {
                case 'undefined': return undefined;
                case 'null'     : return null;
                case 'false'    : return false;
                case 'true'     : return true;
                default         : return isNaN(string) ? accessProperty(string) : parseFloat(string);
            }
        }

        function processFunction (start, end) {
            components.splice(end, 1);
            var fxName = components[start].substring(0, components[start].length - 1);
            var innerComponents = components.splice(start + 1, end);
            processSymbols(innerComponents);
            var params = innerComponents.filter((function (k) {
                return k !== COMMA;
            }));
            components[start] = accessProperty(fxName, params);
            index = start;
        }

        function processParenthesis (start, end) {
            var innerComponents = components.splice(start + 1, end - start - 1);
            processSymbols(innerComponents);
            components.splice(start, 2, innerComponents[0]);
            index = start;
        }

        function processObject (start, end) {
            for (var i = start; i < end; ++i) {
                if (
                    '{' !== components[i] && ':' !== components[i] && '}' !== components[i] && ',' !== components[i] && '[' !== components[i] && ']' !== components[i]
                    && (isNaN(parseFloat(components[i])) || !isFinite(components[i]))
                ) {
                    components[i] = '"'+components[i]+'"';
                }
            }
            var portion  = components.splice(start, (end - start + 1));
            var object = JSON.parse(portion.join(''));
            components[start] = object;
            index = start;
        }

        function processSymbols (ary) {
            ary = ary || components;
            var start;
            var range;
            var value;
            var symbol;
            var idx;
            for (symbol in symbols) {
                if (undefined === symbolsUsed[symbol]) {
                    continue;
                }
                while ((idx = ary.indexOf(symbol)) > -1) {
                    if (symbol === '?') {
                        start = idx - 1;
                        range = 5;
                    } else if (symbol === '!') {
                        start = idx;
                        range = 2;
                    } else {
                        start = (idx - 1) >= 0 ? (idx - 1) : idx;
                        range = (index === start) ? 2 : 3;
                    }
                    value = symbols[symbol](idx, ary);
                    ary.splice(start, range, value);
                }
            }
        }

        var i;
        var len = expr.length;
        var k;
        for (i = 0; i < len; ++i) {
            k = expr[i];
            switch (k) {
                case DOUBLE_QUOTE:
                    if (!inSingleQuote && !inEscaper) {
                        inDoubleQuote = toggle(inDoubleQuote);
                        if (!inDoubleQuote || inSymbol) {
                            prepareNewRow();
                        }
                        continue;
                    }
                    evaluate = false;
                    addInRow(k);
                break;
                case SINGLE_QUOTE:
                    if (!inDoubleQuote && !inEscaper) {
                        inSingleQuote = toggle(inSingleQuote);
                        if (!inSingleQuote || inSymbol) {
                            prepareNewRow();
                        }
                        continue;
                    }
                    evaluate = false;
                    addInRow(k);
                break;
                case ESCAPER:
                    inEscaper = toggle(inEscaper);
                    if (inEscaper) {
                        continue;
                    }
                    addInRow(k);
                break;
                default:
                    if (inQuotes()) {
                        addInRow(k);
                    } else {
                        switch (k) {
                            case SPACE:
                                prepareNewRow();
                            break;
                            case COMMA:
                            case DOUBLE_DOT:
                                inNewRow(k);
                                prepareNewRow();
                            break;
                            case ARRAY_START:
                                inNewRow(k);
                                prepareNewRow();
                                if (0 === openArrays + openObjects) {
                                    addOpenIndex(index);
                                }
                                ++openArrays;
                            break;
                            case ARRAY_END:
                                inNewRow(k);
                                prepareNewRow();
                                --openArrays;
                                if (0 === openArrays + openObjects) {
                                    processObject(getLastOpenIndex(), index);
                                }
                            break;
                            case OBJECT_START:
                                inNewRow(k);
                                prepareNewRow();
                                if (0 === openArrays + openObjects) {
                                    addOpenIndex(index);
                                }
                                ++openObjects;
                            break;
                            case OBJECT_END:
                                inNewRow(k);
                                prepareNewRow();
                                --openObjects;
                                if (0 === openArrays + openObjects) {
                                    processObject(getLastOpenIndex(), index);
                                }
                            break;
                            case PAREN_START:
                                if (isFunction(components[index] + k)) {
                                    evaluate = false;
                                } else {
                                    prepareNewRow();
                                }
                                addInRow(k);
                                prepareNewRow();
                                addOpenIndex(index);
                            break;
                            case PAREN_END:
                                inNewRow(k);
                                prepareNewRow();
                                var lastEntry = getLastOpenIndex();
                                if (isFunction(components[lastEntry])) {
                                    processFunction(lastEntry, index);
                                } else {
                                    processParenthesis(lastEntry, index);
                                }
                            break;
                            default:
                                if (isSymbol(components[index] + k)) {
                                    inSymbol = true;
                                    evaluate = false;
                                    symbolsUsed[components[index] + k] = true;
                                } else if (isSymbol(k)) {
                                    if (!inSymbol) {
                                        prepareNewRow();
                                    }
                                    inSymbol = true;
                                    evaluate = false;
                                    symbolsUsed[k] = true;
                                } else if (inSymbol) {
                                    prepareNewRow();
                                    inSymbol = false;
                                    evaluate = true;
                                    symbolsUsed[components[index]] = true;
                                } else {
                                    evaluate = true;
                                }
                                addInRow(k);
                            break;
                        }
                    }
                break;
            }
        }

        if (evaluate) {
            components[index] = stringToValue(components[index]);
        }

        processSymbols(components);

        if (components.length > 1) {
            throw new Error('Invalid expression "'+expr+'".');
        }

        return components[0];
    };
};

module.exports = new ExprEvaluator();


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

// Requirements
var DOMManipulator = __webpack_require__(0);

/**
 * Request instance is an object containing all elements of a http request.
 *
 * @constructor
 * @param {object} config
 * @return {Request}
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var Request = function (config) {
    this._components = {};
    this._query = {};
    this._post = {};

    return this._build(config);
};

Request.prototype = {

    _event: null,
    _protocol: null,
    _host: null,
    _port: null,
    _path: null,
    _url: null,
    _method: null,
    _hash: null,
    _components: null,
    _query: null,
    _post: null,

    _build: function (config) {
        this._event = config.event;
        var a = document.createElement('a');
        a.href = config.event.target.action || config.event.target.href;
        this._protocol = a.protocol.replace(':', '');
        this._host = a.hostname;
        this._port = parseInt(config.port);
        if (isNaN(this._port)) {
            this._port = parseInt(window.location.port.replace(':'));
            if (isNaN(this._port)) {
                this._port = 'https:' === window.location.protocol ? 443 : 80;
            }
        }
        this._path = a.pathname.replace('//', '/');
        this._url = a.href;
        this._method = (config.event.target.method || 'GET').toUpperCase();
        this._hash = a.hash;
        if (config.route) {
            this._components = config.route.extractParamsFromUrl(a.href);
        }
        if (a.search) {
            this._query = JSON.parse('{"'+decodeURI(a.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"')+'"}');
        }
        if ('FORM' === config.event.target.tagName.toUpperCase() && 'POST' === this._method) {
            this._post = DOMManipulator.formToObject(config.event.target);
        }

        return this;
    },

    /**
     * Get DOM event.
     *
     * @return Event
     */
    getEvent: function () {
        return this._event;
    },

    /**
     * Get uri scheme.
     * @return {string}
     */
    getProtocol: function() {
        return this._protocol;
    },

    /**
     * Get uri host.
     *
     * @return {string}
     */
    getHost: function () {
        return this._host;
    },

    /**
     * Get uri path.
     *
     * @return {string}
     */
    getPath: function () {
        return this._path;
    },

    /**
     * Get requested url.
     *
     * @return {string}
     */
    getUrl: function () {
        return this._url;
    },

    /**
     * Get request port.
     *
     * @return {string}
     */
    getPort: function () {
        return this._port;
    },

    /**
     * Get request method.
     *
     * @return {string}
     */
    getMethod: function () {
        return this._method;
    },

    /**
     * Get hash in request.
     *
     * @return {string}
     */
    getHash: function () {
        return this._hash;
    },

    /**
     * Get uri components.
     *
     * @return {object}
     */
    getUriComponents: function () {
        return this._components;
    },

    /**
     * Get query parameters.
     *
     * @return {object}
     */
    getQueryParams: function () {
        return this._query;
    },

    /**
     * Get post parameters.
     *
     * @return {object}
     */
    getPostParams: function () {
        return this._post;
    }
};

module.exports = Request;


/***/ })
/******/ ]);