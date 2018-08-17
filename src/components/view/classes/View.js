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
    _childsContainer: null,
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
                this['_'+prop] = config[prop];
            } else {
                this[prop] = config[prop];
            }
        }
        if (!this._root && !this._parent) {
            throw new Error('Root must be defined to construct a view.');
        }
        this._context = this._buildContext(this._context || {});
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
        // If inherits another view, return parent node prepared to receive child views
        if (this._parent && !this._root) {
            this._root = this._parent.getChildsContainer();
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
                },
                onChildsContainerFound: function (container) {
                    self._childsContainer = container;
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

    /**
     * Check if view is rendered.
     *
     * @return {Boolean}
     */
    isRendered: function () {
        return this._rendered;
    },

    getChildsContainer: function () {
        return this._childsContainer;
    }
};

module.exports = View;
