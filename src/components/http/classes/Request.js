// Requirements
var DOMManipulator = require('@/components/dom/DOMManipulator');

/**
 * Request instance is an object containing all elements of a http request.
 *
 * @constructor
 * @param {object} config
 * @return {Request}
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var Request = function (config) {
    this._components = {};
    this._query = {};
    this._post = {};

    return this._build(config);
};

Request.prototype = {

    _event: null,
    _protocol: null,
    _host: null,
    _port: null,
    _path: null,
    _url: null,
    _method: null,
    _hash: null,
    _components: null,
    _query: null,
    _post: null,

    _build: function (config) {
        this._event = config.event;
        var a = document.createElement('a');
        a.href = config.event.target.action || config.event.target.href;
        this._protocol = a.protocol.replace(':', '');
        this._host = a.hostname;
        this._port = parseInt(config.port);
        if (isNaN(this._port)) {
            this._port = parseInt(window.location.port.replace(':'));
            if (isNaN(this._port)) {
                this._port = 'https:' === window.location.protocol ? 443 : 80;
            }
        }
        this._path = a.pathname.replace('//', '/');
        this._url = a.href;
        this._method = (config.event.target.method || 'GET').toUpperCase();
        this._hash = a.hash;
        if (config.route) {
            this._components = config.route.extractParamsFromUrl(a.href);
        }
        if (a.search) {
            this._query = JSON.parse('{"'+decodeURI(a.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"')+'"}');
        }
        if ('FORM' === config.event.target.tagName.toUpperCase() && 'POST' === this._method) {
            this._post = DOMManipulator.formToObject(config.event.target);
        }

        return this;
    },

    /**
     * Get DOM event.
     *
     * @return Event
     */
    getEvent: function () {
        return this._event;
    },

    /**
     * Get uri scheme.
     * @return {string}
     */
    getProtocol: function() {
        return this._protocol;
    },

    /**
     * Get uri host.
     *
     * @return {string}
     */
    getHost: function () {
        return this._host;
    },

    /**
     * Get uri path.
     *
     * @return {string}
     */
    getPath: function () {
        return this._path;
    },

    /**
     * Get requested url.
     *
     * @return {string}
     */
    getUrl: function () {
        return this._url;
    },

    /**
     * Get request port.
     *
     * @return {string}
     */
    getPort: function () {
        return this._port;
    },

    /**
     * Get request method.
     *
     * @return {string}
     */
    getMethod: function () {
        return this._method;
    },

    /**
     * Get hash in request.
     *
     * @return {string}
     */
    getHash: function () {
        return this._hash;
    },

    /**
     * Get uri components.
     *
     * @return {object}
     */
    getUriComponents: function () {
        return this._components;
    },

    /**
     * Get query parameters.
     *
     * @return {object}
     */
    getQueryParams: function () {
        return this._query;
    },

    /**
     * Get post parameters.
     *
     * @return {object}
     */
    getPostParams: function () {
        return this._post;
    }
};

module.exports = Request;
