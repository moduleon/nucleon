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
