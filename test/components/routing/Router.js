var assert = require('assert');

describe('src/components/routing/Router', function () {

    // Create a virtual window, document for running tests.
    before(function () {
        require('../../jsdom-handler')();
    });

    var route;
    var Route = require('../../../src/components/routing/classes/Route');
    var router = require('../../../src/components/routing/Router');

    describe.only('.register(route)', function () {
        it('Should return router instance', function (done) {
            route = new Route({
                name: 'user_message_list',
                scheme: 'message::list',
                method: 'GET',
                path: '/user/{userId}/message',
                params: {
                    userId: 'number'
                }
            });
            assert.equal(router.register(route), router);
            done();
        });
        it('Should throw a error if called again with the same route', function (done) {
            var shouldThrow = function () {
                router.register(route);
            };
            assert.throws(shouldThrow, Error, 'A route with name "user_message_list" is already registered.');
            done();
        });
    });

    describe.only('.findRoute(url, method)', function () {
        it('Should find registered route', function (done) {
            assert.equal(router.findRoute('/user/1/message', 'GET'), route);
            done();
        });
        it('Should return null for a non matching url', function (done) {
            assert.equal(router.findRoute('/user/1/profile', 'GET'), null);
            done();
        });
        it('Should return null for a non matching method', function (done) {
            assert.equal(router.findRoute('/user/1/message', 'POST'), null);
            done();
        });
    });

    describe.only('.generateUrl(url, parameters)', function () {
        it('Should return an url for registered route', function (done) {
            assert.equal(router.generateUrl('user_message_list', { userId: 1 }), '/user/1/message');
            done();
        });
        it('Should throw an error for an unregistered route name', function (done) {
            var shouldThrow = function () {
                router.generateUrl('user_message_show');
            };
            assert.throws(shouldThrow, Error, 'Try to generate an url for a route named "user_message_show" that is not registered.');
            done();
        });
    });
});
