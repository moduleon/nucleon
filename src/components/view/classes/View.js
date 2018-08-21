// Requirements
var client = require('@/components/http/Client');
var DOMManipulator = require('@/components/dom/DOMManipulator');
var Fusioner = require('@/components/view/classes/Fusioner');
var Model = require('@/components/model/classes/Model');
var router = require('@/components/routing/Router');
var views = require('@/components/view/Views');

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
    _parent: null,
    _components: null,
    // Event callbacks
    _onMounted: null,
    _onRender: null,
    _onRendered: null,
    _onUpdate: null,
    _onUpdated: null,
    _onRevoke: null,
    _onRevoked: null,
    // Inner vars
    _mounted: false,
    _elements: [],
    _position: null,
    _fusioner: null,
    _rendered: false,
    _childsRoot: null,
    _childsPosition: null,

    _buildConfig: function (config) {
        for (var prop in config) {
            if (prop === 'components') {
                this._components = {};
                for (var componentName in config[prop]) {
                    this._components[componentName.toLowerCase()] = config[prop][componentName];
                }
                continue;
            }
            if (null === this['_'+prop]) {
                this['_'+prop] = config[prop];
            } else {
                this[prop] = config[prop];
            }
        }
        this._context = this._buildContext(this._context || {});
    },

    _buildContext: function (context) {
        if (context instanceof Model) {
            return context;
        }
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
        // If inherits another view, return parent node if no root defined
        if (this._parent && !this._root) {
            this._root = this._parent._getRoot();
        // Elsewise, try to find a dom element matching
        } else if ('string' === typeof this._root) {
            var root = DOMManipulator.first(this._root);
            if (!root) {
                throw new Error('Root element with selector "'+this._root+'" could not been found.');
            }
            this._root = root;
        }

        return this._root;
    },

    _mount: function () {
        var self = this;

        // Template is a remote file, and is not loaded
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
            this._elements = [this._getRoot()];
        }

        // Template is still a string value, and have not been turn into DOM element
        if ('string' === typeof this._template && !this._elements.length) {
            // Create html elements from string
            var elements = DOMManipulator.createElement(this._template);
            if (elements instanceof HTMLElement) {
                this._elements = [elements];
            } else if (elements instanceof DocumentFragment) {
                this._elements = [];
                while (elements.firstChild) {
                    this._elements.push(elements.removeChild(elements.firstChild));
                }
            }
        }

        // Bind context to template if not done yet
        if (!this._fusioner) {
            var fusionerConfig = {
                elements: this._elements,
                context: this._context,
                components: this._components,
                view: this,
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

        // If view has a parent, get root and position prepared for childs views
        if (this._parent) {
            this._root = this._parent._childsRoot;
            this._position = this._parent._childsPosition;
        }

        this._mounted = true;
    },

    /**
     * Insert view elements in the DOM.
     */
    render: function (callback) {

        var self = this;

        // Inheritance
        if (this._parent) {
            if (typeof this._parent === 'string') {
                this._parent = views.get(this._parent);
            } else if (!(this._parent instanceof View)) {
                throw new Error('View parent must be either another view name or instance.');
            }
            if (!this._parent.isRendered()) {
                return this._parent.render(function () {
                    self.render(callback);
                });
            }
        }

        if (!this._mounted) {
            this._mount();
        }

        // Template is not rendered
        if (!this._rendered) {
            // Call onRender callback
            if ('function' === typeof this._onRender) {
                this._onRender();
            }
            // Insert elements
            var root = this._getRoot();
            if (this._elements[0] !== root) {
                DOMManipulator.insertElements(this._elements, root, this._position);
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

        if (typeof callback === 'function') {
            callback();
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
            if (this._elements[0] !== root) {
                // Remove each elements
                for (var i = 0, len = this._elements.length; i < len; ++i) {
                    DOMManipulator.removeElement(this._elements[i]);
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

    /**
     * Check if view is rendered.
     *
     * @return {Boolean}
     */
    isRendered: function () {
        return this._rendered;
    },

    /**
     * Get childs view root.
     *
     * @return {HTMLElement}
     */
    getChildsRoot: function () {
        return this._childsRoot;
    },

    /**
     * Clone view with a new config.
     *
     * @param  {object} newConfig
     *
     * @return {View}
     */
    clone: function (config) {
        config = config || {};
        config.root = config.root || this._root;
        config.template = config.template || this._template;
        config.templateUrl = config.templateUrl || this._templateUrl;
        config.parent = config.parent || this._parent;
        config.onMounted = config.onMounted || this._onMounted;
        config.onRender = config.onRender || this.onRender;
        config.onRendered = config.onRendered || this._onRendered;
        config.onUpdate = config.onUpdate || this._onUpdate;
        config.onUpdated = config.onUpdated || this._onUpdated;
        config.onRevoke = config.onRevoke || this._onRevoke;
        config.onRevoked = config.onRevoked || this._onRevoked;
        config.context = config.context || {};

        return new View(config);
    }
};

module.exports = View;
