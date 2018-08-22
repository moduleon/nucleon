// Requirements
var Model = require('../../../src/components/model/classes/Model');

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
