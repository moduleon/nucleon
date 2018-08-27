// Requirements
var accessor = require('../../../../src/components/property/PropertyAccessor');
var DOMManipulator = require('../../../../src/components/dom/DOMManipulator');
var events = require('../../../../src/components/event/Events');
var processor = require('../../../../src/components/processor/ExprEvaluator');
var Model = require('../../../../src/components/model/classes/Model');
var Collection = require('../../../../src/components/model/classes/Collection');

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
    if (false === config.elements instanceof Array) {
        config.elements = [config.elements];
    }
    this._elements = config.elements;
    this._context = config.context;
    this._view = config.view;
    this._components = config.components;
    this._shouldApply = config.shouldApply;
    this._onUpdate = config.onUpdate;
    this._onUpdated = config.onUpdated;
    for (var i = this._elements.length - 1; i >= 0; --i) {
        this._bind(this._elements[i]);
    }

    return this;
};

Fusioner.prototype = {

    _elements: null,
    _context: null,
    _shouldApply: null,
    _onUpdate: null,
    _onUpdated: null,
    _init: null,
    _waiting: null,
    _events: null,
    _view: null,

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
        var portions = string.split(/[ |(|)|{|}|[|]|,|:|\+]/g);
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
                    if (this._waiting.indexOf(this._events[eventPath][i]) !== -1) {
                        continue;
                    }
                    this._waiting.push(this._events[eventPath][i]);
                }
            }
        }
    },

    _createComponent: function (element, aliases, baseComponent, parentNode, position) {
        var self = this;
        // Build component base context
        var name;
        var context = {};
        var baseComponentContext = baseComponent.getContext();
        for (name in baseComponentContext) {
            if ('on' === name || 'trigger' === name) {
                continue;
            }
            context[name] = baseComponentContext[name];
        }

        // Import values to inject in it
        var references;
        if (element.hasAttribute('data-context')) {
            var expr = element.getAttribute('data-context');
            references = processor.process(expr, {}, false);
            for (name in references) {
                references[name] = this._replaceAliases(references[name], aliases);
                context[name] = processor.process(references[name], this._context);
            }
        }

        // Build context
        context = new Model(context);

        // Build component
        var root = parentNode || element.parentNode || this._view._getRoot();
        position = position || DOMManipulator.getPosition(element);
        var component = baseComponent.clone({ context: context, root: root, position: position });

        // Bind modification for shared properties
        component._mount();
        if (references) {
            for (name in references) {
                this._extractContextProperties(references[name] + '').forEach(function (prop) {
                    // Component to view changes
                    component._fusioner._on('change', component._fusioner._extractContextProperties(name)[0], function (newValue) {
                        // Handle missing values (callback on queue)
                        newValue = newValue || accessor.getPropertyValue(component._context, name);
                        accessor.setPropertyValue(self._context, references[name], newValue);
                    });
                    // View to component changes
                    self._on('change', prop, function (newValue) {
                        // Handle missing values (callback on queue)
                        newValue = newValue || accessor.getPropertyValue(self._context, references[name]);
                        accessor.setPropertyValue(context, name, newValue);
                    });
                });
            }
        }

        // Handle conditional rendering
        if (element.hasAttribute('data-if')) {
            (function (expr) {
                var handleInsertion = function () {
                    var result = processor.process(expr, self._context);
                    if (undefined === result || false === result || null === result || '' === result) {
                        component.revoke();
                    } else {
                        component.render();
                    }
                };
                handleInsertion();
                self._extractContextProperties(expr).forEach(function (prop) {
                    if ('function' !== typeof accessor.getPropertyValue(self._context, self._getPropPath(prop))) {
                        self._on('change', prop, handleInsertion);
                    }
                });
            }(this._replaceAliases(element.getAttribute('data-if'), aliases)));
        } else {
            component.render();
        }

        return component;
    },

    _removeElement: function (element) {
        if (element.parentNode) {
            DOMManipulator.removeElement(element);
        } else {
            var index = this._elements.indexOf(element);
            if (-1 !== index) {
                this._elements.splice(index, 1);
            }
        }
    },

    _bind: function (element, aliases) {

        if (!element) {
            return;
        }

        // HTMLElement
        if (1 === element.nodeType) {

            // No binding
            if (element.hasAttribute('data-no-bind')) {
                return;
            }

            var tagName = element.tagName.toLowerCase();

            // Childs root
            if ('child-views' === tagName) {
                this._view._childsRoot = element.parentNode || this._view._getRoot();
                this._view._childsPosition = DOMManipulator.getPosition(element);
                this._removeElement(element);
                return;
            }

            // Component
            if (this._components && this._components[tagName]) {
                return this._bindComponent(element, aliases, tagName);
            }

            // Other
            return this._bindElement(element, aliases, tagName);

        // TextNode
        } else if (3 === element.nodeType) {
            return this._bindTextNode(element, aliases);
        }

        return element;
    },

    _bindElement: function (element, aliases, tagName) {

        var self = this;
        var attr;
        var prop;
        var propPath;
        var eventName;
        var i;
        var len;

        // Loop
        if (element.hasAttribute('data-for')) {

            // Set up base values
            attr = element.getAttribute('data-for');
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
            this._removeElement(element);
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
        if (element.hasAttribute('data-bind')) {
            attr = element.getAttribute('data-bind');
            prop = this._extractContextProperties(attr);
            if (0 === prop.length) {
                throw new Error('Data-bind with value "'+attr+'" refers to a non existing context property.');
            }

            prop = prop[0];
            propPath = this._getPropPath(prop);

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
                    element.value = null !== newValue ? newValue : '';
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
            element.removeAttribute('data-bind');
        }

        // Events
        if (element.hasAttribute('data-events')) {
            var dataEvents = element.getAttribute('data-events').split(';');
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
        if (element.hasAttribute('data-if')) {
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
            }(element.getAttribute('data-if')));
            element.removeAttribute('data-if');
        }

        // Conditional displaying
        if (element.hasAttribute('data-show')) {
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
            }(element.getAttribute('data-show')));
            element.removeAttribute('data-show');
        }

        // Left attributes
        if (element.attributes) {
            var name;
            var content;
            var markers;
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

        // Recursive binding
        if (element.childNodes.length > 0) {
            for (i = element.childNodes.length - 1; i >= 0; --i) {
                this._bind(element.childNodes[i], aliases);
            }
        }
    },

    _bindTextNode: function (element, aliases) {
        var contentProp = element.textContent ? 'textContent' : 'nodeValue'; // IE8 polyfill
        var content = element[contentProp].trim();
        if (content) {
            content = this._replaceAliases(content, aliases);
            var markers = this._extractMarkers(content);
            if (markers.length > 0) {
                var self = this;
                var updateContent = function () {
                    var newContent = content;
                    for (var i = 0, len = markers.length; i < len; ++i) {
                        newContent = newContent.replace(markers[i].outer, self._evaluateText(markers[i].inner));
                    }
                    element[contentProp] = newContent;
                };
                updateContent();
                for (var i = 0, len = markers.length; i < len; ++i) {
                    this._extractContextProperties(markers[i].inner).forEach(function (prop) {
                        if ('function' !== typeof accessor.getPropertyValue(self._context, self._getPropPath(prop))) {
                            self._on('change', prop, updateContent);
                        }
                    });
                }
            }
        }
    },

    _bindComponent: function (element, aliases, tagName) {
        var self = this;
        var parentNode = element.parentNode || this._view._getRoot();
        this._removeElement(element);

        // Loop
        if (element.hasAttribute('data-for')) {

            aliases = aliases || {};

            var attr = element.getAttribute('data-for');
            var alias = attr.replace(/in .*/, '').trim();
            var key = null;
            if (alias.indexOf(',') !== -1) {
                alias = alias.split(',');
                key = alias[0].trim();
                alias = alias[1].trim();
            }
            var expr = this._replaceAliases(attr.replace(/.* in/, '').trim(), aliases);
            var iterable = processor.process(expr, this._context);
            if (
                undefined === iterable || (
                    false === iterable instanceof Collection &&
                    false === iterable instanceof Object &&
                    'number' !== typeof iterable
                )
            ) {
                throw new Error(expr+' is an invalid expression for a loop.');
            }

            var props = this._extractContextProperties(expr);
            var propPath = props.length ? this._getPropPath(props[0]) : null;

            var components = [];

            // For i in collection length
            if (iterable instanceof Collection) {
                var updateComponentsForCollection = function (newCollection) {
                    newCollection = newCollection || accessor.getPropertyValue(self._context, propPath);
                    var i;
                    var len;
                    // New collection longer than old collection
                    if (newCollection.length > components.length) {
                        for (i = components.length, len = newCollection.length; i < len; ++i) {
                            aliases[alias] = propPath+'.'+i;
                            if (key) {
                                aliases[key] = i+'';
                            }
                            components.push(self._createComponent(element, aliases, self._components[tagName], parentNode));
                        }
                    // New collection smaller than old collection
                    } else {
                        for (i = components.length - 1, len = newCollection.length - 1; i > len; --i) {
                            components[i].revoke();
                            components.splice(i, 1)[0] = null;
                        }
                    }
                };
                updateComponentsForCollection(iterable);
                this._on('change', props[0], updateComponentsForCollection);

            // For prop name in object
            } else if (iterable instanceof Object) {
                var updateComponentForObject = function (newObject) {
                    for (var i = components.length - 1; i >= 0; --i) {
                        components[i].revoke();
                        components.splice(i, 1)[0] = null;
                    }
                    newObject = newObject || accessor.getPropertyValue(self._context, propPath);
                    for (var propName in iterable) {
                        if (!newObject.hasOwnProperty(propName) || 'function' === typeof newObject[propName]) {
                            continue;
                        }
                        if (key) {
                            aliases[key] = propName;
                        }
                        aliases[alias] = propPath;
                        components.push(self._createComponent(element, aliases, self._components[tagName], parentNode));
                    }
                };
                updateComponentForObject(iterable);
                this._on('change', props[0], updateComponentForObject);

            // For i in number
            } else if ('number' === typeof iterable) {
                var updateComponentForNumber = function (newNumber) {
                    newNumber = newNumber || processor.process(expr, self._context);
                    var i;
                    if (newNumber > components.length) {
                        for (i = components.length; i < newNumber; ++i) {
                            aliases[alias] = i+'';
                            components.push(self._createComponent(element, aliases, self._components[tagName], parentNode));
                        }
                    } else if (newNumber < components.length) {
                        for (i = components.length - 1; i > newNumber; --i) {
                            components[i].revoke();
                            components.splice(i, 1)[0] = null;
                        }
                    }
                };
                updateComponentForNumber(iterable);
                if (props.length === 0) {
                    this._on('change', props[0], updateComponentForNumber);
                } else if (props.length > 1) {
                    for (var i = props.length - 1; i >= 0; --i) {
                        this._on('change', props[i], function () {
                            updateComponentForNumber(); // Don't pass value, which rely on multiple context values. Force recalculate.
                        });
                    }
                }
            }

            return;
        }

        // Single
        this._createComponent(element, aliases, this._components[tagName], parentNode);
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
