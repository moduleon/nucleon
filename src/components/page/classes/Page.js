// Requirements
var Route = require('@/components/routing/classes/Route');
var router = require('@/components/routing/Router');
var history = require('@/components/browser/History');
var views = require('@/components/view/Views');
var View = require('@/components/view/classes/View');

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

        if (!config.fn && !config.view) {
            throw new Error('Page "'+config.name+'" must have a function or a view.');
        }
        if (config.fn && 'function' !== typeof config.fn) {
            throw new Error('"fn" declared in page "'+config.name+'" is not a function.');
        }
        this._fn = config.fn || function () {
            this.renderView();
        };

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
            if (!(config.view instanceof View)) {
                config.view = views.add(this._name+'_view', config.view);
            }
            this._view = config.view;
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
