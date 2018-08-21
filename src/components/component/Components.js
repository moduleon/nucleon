var View = require('@/components/view/classes/View');

var components = function () {

    var storage = {};

    this.register = function (name, config) {
        if (undefined !== storage[name]) {
            throw new Error('A component with the name "'+name+'" is already defined.');
        }
        storage[name] = config;

        return this;
    };

    this.generate = function (name, config) {

    };
};
