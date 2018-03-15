/**
 * Client offers an api to perform ajax request.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var Client = function () {
    this._cache = {};

    return this;
};

Client.prototype = {

    /**
     * Cache storage.
     * @type {Object}
     */
    _cache: null,

    /**
     * Build config from given parameters.
     *
     * @param  {string} url
     * @param  {string} method
     * @param  {object} data
     * @param  {object} config
     *
     * @return {object}
     */
    _buildConfig: function (url, method, data, config) {
        config = config || {};
        config.method = method;
        config.url = url;
        config.data = data;

        return config;
    },

    /**
     * Initialize config values.
     *
     * @param  {object} config
     *
     * @return {object}
     */
    _initConfig: function (config) {
        if (!config.url) {
            throw new Error('No url provided.');
        }
        config.method = config.method || 'GET';
        if (['GET', 'POST', 'PUT', 'DELETE'].indexOf(config.method) === -1) {
            throw new Error('Only methods GET, PUT, POST, DELETE are allowed.');
        }
        if ('GET' === config.method && config.data) {
            var query = [];
            for (var key in config.data) {
                query.push(encodeURIComponent(key)+'='+encodeURIComponent(config.data[key]));
            }
            query = query.join('&');
            config.url += (config.url.indexOf('?') === -1 ? '?' : '&')+query;
            config.data = null;
        } else if ('POST' === config.method || 'PUT' === config.method) {
            if ('JSON' === config.dataType) {
                config.data = JSON.stringify(config.data);
            } else {
                var formData = new FormData();
                for (var name in config.data) {
                    formData.append(name, config.data[name]);
                }
                config.data = formData;
            }
        }
        config.format = config.format || null;
        config.headers = config.headers || {};
        config.async = config.async !== false ? true : false;
        config.cors = config.cors === true ? true : false;
        config.cache = config.cache === true ? true : false;
        config.success = config.success || function () {};
        config.error = config.error || function () {};
        config.always = config.always || function () {};
        config.progress = config.progress || function () {};
        config.timeout = config.timeout || function () {};

        return config;
    },

    /**
     * Build object containing method for running callbacks.
     *
     * @param  {object} config
     * @param  {object} req
     *
     * @return {object}
     */
    _buildPublicApi: function (config, req) {
        return {
            success: function (callback) {
                config.success = callback;
                return this;
            },
            error: function (callback) {
                config.error = callback;
                return this;
            },
            always: function (callback) {
                config.always = callback;
                return this;
            },
            abort: function () {
                req.abort();
                return this;
            }
        };
    },

    /**
     * Handle request error.
     *
     * @param  {object} config
     * @param  {object} req
     * @param  {object} response
     *
     * @return {void}
     */
    _handleError: function (config, req, response) {
        if (config.error) {
            config.error.call(config, response, req.status);
            config.error = null;
            config.always.call(config);
        }
    },

    /**
     * Handle server response.
     *
     * @param  {object} config
     * @param  {object} req
     *
     * @return {object}
     */
    _handleResponse: function (config, req) {
        var response = this._parseResponse(config, req.responseText);
        if (req.status >= 200 && req.status < 400) {
            if (config.cache && 'GET' === config.method) {
                this._cache[config.url] = req.responseText;
            }
            config.success.call(config, response, req.status);
            config.always.call(config);
        } else {
            this._handleError(config, req, response);
        }

        return response;
    },

    /**
     * Parse response to expected format.
     *
     * @param  {object} config
     * @param  {object} responseText
     *
     * @return {mixed}
     */
    _parseResponse: function (config, responseText) {
        if ('JSON' === config.format) {
            return JSON.parse(responseText);
        }

        return responseText;
    },

    /**
     * Send an ajax request.
     *
     * @param  {object} config
     *
     * @return {object}
     */
    call: function (config) {

        // Build config
        config = this._initConfig(config);

        var self = this;
        var req;

        // Return cache response if there is one
        if ('GET' === config.method && this._cache[config.url] && false !== config.cache) {
            req = { responseText: this._cache[config.url], status: 200 };
            if (!config.async) {
                return this._handleResponse(config, req);
            } else {
                setTimeout(function () {
                    self._handleResponse(config, req);
                }, 1);
                return this._buildPublicApi(config, req);
            }
        }

        // Build request object
        req = new(XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
        if (config.cors) {
            if ('withCredentials' in req) {
                // Do nothing
            } else if ('undefined' === typeof XDomainRequest) {
                req = new XDomainRequest();
            } else {
                throw new Error('Your browser does not support CORS request.');
            }
        }

        // Open it
        req.open(config.method, config.url, config.async);

        // Set headers
        if (req.setRequestHeader) {
            // Set default headers
            req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            if (('POST' === config.method || 'PUT' === config.method) && 'JSON' === config.dataType) {
                req.setRequestHeader('Content-Type', 'application/json');
            }
            // Include those given in config
            for (var key in config.headers) {
                req.setRequestHeader(key, config.headers[key]);
            }
        }

        // Not async call
        if (!config.async) {
            req.send(config.data);
            return this._handleResponse(config, req);
        }

        // Async call. Set up events
        if (req.onprogress && config.onprogress) {
            req.onprogress = function () {
                if (req.lengthComputable) {
                    var percentComplete = req.loaded / req.total;
                    config.progress(percentComplete);
                }
            };
        }
        if (req.ontimeout && config.ontimeout) {
            req.ontimeout = config.timeout;
        }
        req.onreadystatechange = function () {
            if (req.readyState > 3) {
                self._handleResponse(config, req);
            }
        };
        req.onerror = function () {
            self._handleResponse(config, req);
        };

        // Send request
        setTimeout(function () {
            req.send(config.data);
        }, 0);

        return this._buildPublicApi(config, req);
    },

    /**
     * Send a GET request.
     *
     * @param  {string} url
     * @param  {object} data
     * @param  {object} config
     *
     * @return {object}
     */
    get: function (url, data, config) {
        return this.call(this._buildConfig(url, 'GET', data, config));
    },

    /**
     * Send a POST request.
     *
     * @param  {string} url
     * @param  {object} data
     * @param  {object} config
     *
     * @return {object}
     */
    post: function (url, data, config) {
        return this.call(this._buildConfig(url, 'POST', data, config));
    },

    /**
     * Send a PUT request.
     *
     * @param  {string} url
     * @param  {object} data
     * @param  {object} config
     *
     * @return {object}
     */
    put: function (url, data, config) {
        return this.call(this._buildConfig(url, 'PUT', data, config));
    },

    /**
     * Send a DELETE request.
     *
     * @param  {string} url
     * @param  {object} data
     * @param  {object} config
     *
     * @return {object}
     */
    delete: function (url, data, config) {
        return this.call(this._buildConfig(url, 'DELETE', data, config));
    }
};

module.exports = new Client();
