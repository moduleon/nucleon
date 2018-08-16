// Requirements
var View = require('@/components/view/classes/View');

/**
 * Views is a container for View instances.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var views = new function () {

    var storage = {};

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
            var root = storage[name]._getRoot();
            var view;
            for (var viewName in storage) {
                if (viewName === name) {
                    continue;
                }
                view = storage[viewName];
                if (view.isRendered() && view._getRoot() === root) {
                    view.revoke();
                }
            }
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
        storage[name].revoke();
    };
};

module.exports = views;
