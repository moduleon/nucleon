var assert = require('assert');

describe.skip('src/components/http/Client', function () {

    // Emulate the browser XMLHttpRequest object
    before(function () {
        require('../../jsdom-handler')({
            url: 'http://localhost'
        });
        global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    });

    var httpClient = require('../../../src/components/http/Client');

    describe.only('.get(url, data, config)', function () {
        it('Should fetch data from url', function (done) {
            httpClient
                .get('http://localhost')
                .success(function (data) {})
                .error(function (message) {})
                .always(function () {})
                .abort()
            ;
            done();
        });
    });
    describe.only('.post(url, data, config)', function () {
        it('Should send data to url', function (done) {
            httpClient
                .post('http://localhost', { prop: 'value' })
                .success(function (data) {})
                .error(function (message) {})
                .always(function () {})
                .abort()
            ;
            done();
        });
    });
    describe.only('.put(url, data, config)', function () {
        it('Should send data to url', function (done) {
            httpClient
                .put('http://localhost', { prop: 'value' })
                .success(function (data) {})
                .error(function (message) {})
                .always(function () {})
                .abort()
            ;
            done();
        });
    });
    describe.only('.delete(url, data, config)', function () {
        it('Should delete data from url', function (done) {
            httpClient
                .delete('http://localhost', { prop: 'value' })
                .success(function (data) {})
                .error(function (message) {})
                .always(function () {})
                .abort()
            ;
            done();
        });
    });
});
