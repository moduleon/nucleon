/**
 * Route is an object checking if a url match with a certain pattern and method.
 *
 * @constructor
 * @param {object} config
 * @return {Route}
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var Route = function  (config) {
    this._params = {};

    return this._build(config);
};

Route.prototype = {

    _path: null,
    _pattern: null,
    _params: null,
    _method: null,
    _name: null,
    _scheme: null,

    _build: function (config) {
        this._setMethod(config.method || 'GET');
        if (config.params) {
            this._setParams(config.params);
        }
        if (config.path) {
            this._setPath(config.path);
        } else {
            throw new Error('Path must be defined.');
        }
        if (config.name) {
            this._name = config.name;
        } else {
            throw new Error('Name must be defined.');
        }
        if (config.scheme) {
            this._scheme = config.scheme;
        }

        return this;
    },

    _setMethod: function (method) {
        method = method.toUpperCase();
        if ('GET' !== method && 'POST' !== method && 'GET|POST' !== method && 'POST|GET' !== method) {
            throw new Error('Method is not supported. "GET", "POST", "GET|POST" only.');
        }
        this._method = new RegExp(method);

        return this;
    },

    _setParams: function (params) {
        if (false === params instanceof Object) {
            throw new Error('Params must be an object.');
        }
        // Handle shortcuts
        for (var name in params) {
            if ('number' === params[name]) {
                params[name] = '[0-9]+';
            } else if ('word' === params[name]) {
                params[name] = '[a-zA-Z0-9%]+';
            } else if ('slug' === params[name]) {
                params[name] = '[a-zA-Z0-9_-]+';
            }
        }
        this._params = params;

        return this;
    },

    _setPath: function (path) {
        this._path = path;
        this._setPattern(path);

        return this;
    },

    _setPattern: function (path) {
        this._pattern = path;
        var marker;
        for (var name in this._params) {
            marker = '{'+name+'}';
            if (-1 === this._pattern.indexOf(marker)) {
                throw new Error('Parameter "'+name+'" is not in route path "'+path+'".');
            }
            this._pattern = this._pattern.replace(marker, this._params[name]);
        }
        if (-1 === this._pattern.indexOf(window.location.host)) {
            this._pattern = window.location.host+this._pattern;
        }
        this._pattern += '$';
        this._pattern = new RegExp(this._pattern);

        return this;
    },

    /**
     * Check if route match with a given url and method.
     *
     * @param  {string} url
     * @param  {string} method
     *
     * @return {boolean}
     */
    match: function (url, method) {
        url = url.split('?')[0];
        return this._pattern.test(url) && this._method.test(method);
    },

    /**
     * Extract parameters values from a given url.
     *
     * @param  {string} url
     *
     * @return {object}
     */
    extractParamsFromUrl: function (url) {
        var capturingPattern;
        var params = {};
        var nameRepeat;
        var match;
        for (var name in this._params) {
            capturingPattern = this._path;
            for (nameRepeat in this._params) {
                capturingPattern = capturingPattern.replace('{'+nameRepeat+'}', (name === nameRepeat ? '('+this._params[nameRepeat]+')' : this._params[nameRepeat]));
            }
            if ((match = new RegExp(capturingPattern).exec(url))) {
                params[name] = decodeURI(match[1]);
            }
        }

        return params;
    },

    /**
     * Generate an url with given parameters.
     *
     * @param  {object} params
     * @param  {boolean} withHost
     *
     * @return {string}
     */
    generateUrlWithParams: function (params, withHost) {
        var url = this._path;
        var queryParams = [];
        var marker;
        for (var name in params) {
            marker = '{'+name+'}';
            if (-1 !== url.indexOf(marker)) {
                if (new RegExp(this._params[name]).test(params[name])) {
                    url = url.replace(marker, params[name]);
                } else {
                    throw new Error('Invalid parameter "'+name+'" for route path "'+this._path+'". Must match "'+this._params[name]+'".');
                }
            } else {
                queryParams.push(encodeURI(name)+'='+encodeURI(params[name]));
            }
        }
        if (queryParams.length > 0) {
            url += (-1 === url.indexOf('?') ? '?' : '&')+queryParams.join('&');
        }
        if (true === withHost) {
            url = window.location.protocol+'//'+window.location.host+url;
        }

        return url;
    },

    /**
     * Get route name.
     *
     * @return {string}
     */
    getName: function () {
        return this._name;
    },

    /**
     * Get route scheme.
     *
     * @return {string}
     */
    getScheme: function () {
        return this._scheme;
    }
};

module.exports = Route;
