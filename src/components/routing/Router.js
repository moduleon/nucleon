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
