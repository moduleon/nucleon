/**
 * Redirect is a function allowing to redirect to a controller action by giving an url.
 *
 * @param {string}  url
 * @param {boolean} inHistory
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var redirect = function (url, storeInHistory) {
    var pages = require('../../../src/components/page/Pages');
    var btn = document.createElement('a');
    btn.href = url;

    return pages.delegate({ preventDefault: function () {}, target: btn }, storeInHistory);
};

module.exports = redirect;
