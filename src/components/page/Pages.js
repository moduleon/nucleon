// Requirements
var Page = require('../../../src/components/page/classes/Page');
var Request = require('../../../src/components/http/classes/Request');
var innerEvents = require('../../../src/components/event/InnerEvents');
var router = require('../../../src/components/routing/Router');
var redirect = require('../../../src/components/http/Redirect');
var channel = require('../../../src/components/channel/Channel.js');

/**
 * Pages is a container for Page instances.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var pages = new function () {

    var storage = {};

    /**
     * Add a page in the app.
     *
     * @param {string} name
     * @param {object} config
     *
     * @return {self}
     */
    this.add = function (name, config) {
        if (undefined !== storage[name]) {
            throw new Error('A page with the name "'+name+'" is already defined.');
        }
        config.name = name;
        storage[name] = new Page(config);

        return this;
    };

    /**
     * Get a page from the app.
     *
     * @param  {string} name
     *
     * @return {Page}
     */
    this.get = function (name) {
        if (undefined === storage[name]) {
            throw new Error('No page with the name "'+name+'" could be found.');
        }

        return storage[name];
    };

    /**
     * Request delegation.
     * Try to find a page, and run it if found.
     *
     * @param  {object} event
     * @param  {boolean|undefined} storeInHistory
     *
     * @return {boolean}
     */
    this.delegate = function (event, storeInHistory) {
        if (!event) {
            return;
        }
        // Prevent execution if event target has a "data-no-follow" attribute
        var target = event.target;
        if (target.getAttribute('data-no-follow')) {
            return;
        }
        // Prevent default behaviour when clicking on a link having href="#"
        var tagName = target.tagName.toUpperCase();
        var url = 'FORM' === tagName ? target.action : target.href;
        if (/#$/.test(url)) {
            event.preventDefault();
            return;
        }
        // Try finding a route
        var method = 'FORM' === tagName ? target.method.toUpperCase() : 'GET';
        var route = router.findRoute(url, method);
        if (!route) {
            // INNER APP EVENT - No route has been found
            channel.trigger('route.not_found', new Request({ event: event }));
            return;
        }
        var request = new Request({ event: event, route: route });
        // INNER APP EVENT - Route found
        if (false === channel.trigger('route.found', request)) {
            return;
        }
        var page = storage[route.getScheme()];
        if (!page) {
            return;
        }
        // INNER APP EVENT - Page about to be run
        if (false === channel.trigger('page.pre_run', request)) {
            return;
        }
        // Run the page
        event.preventDefault();
        storeInHistory = undefined === storeInHistory ? true : false;
        page.run(request, storeInHistory);
        // INNER APP EVENT - Page has been run
        channel.trigger('page.post_run', request);

        return false;
    };

    innerEvents
        .on('click', '[href]', this.delegate)
        .on('submit', 'form', this.delegate)
        .on('load', window, function () {
            redirect(window.location.href, false);
        })
    ;
};

module.exports = pages;
