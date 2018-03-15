/**
 * Add or clean a jsdom (creating window, document in global object)
 */
var jsdomLoaded = false;
module.exports = function (config) {
    var jsdom = require('jsdom-global');
    config = config || {};
    if (false === jsdomLoaded) {
        jsdom(undefined, config);
        jsdomLoaded = true;
    } else {
        var cleanup = jsdom();
        cleanup();
        jsdom(undefined, config);
    }
};
