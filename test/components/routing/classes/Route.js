var assert = require('assert');

describe('src/components/routing/classes/Route', function () {

    // Create a virtual window, document for running tests.
    before(function () {
        require('../../../jsdom-handler')();
    });

    var Route = require('../../../../src/components/routing/classes/Route');
    var route;

    describe.only('new Route(config)', function () {
        it('Should return a new Route instance', function (done) {
            route = new Route({
                name: 'user_post_details',
                scheme: 'post::show',
                method: 'GET',
                path: '/user/{userId}/post/{postSlug}',
                params: {
                    userId: 'number',
                    postSlug: 'slug'
                }
            });
            assert.equal(route instanceof Route, true);
            done();
        });
    });

    describe.only('.match(url)', function () {
        it('Should return true for GET "/user/1/post/hello-world"', function (done) {
            assert.equal(route.match('/user/1/post/hello-world', 'GET'), true);
            done();
        });
        it('Should return true for GET "/user/1/post/1"', function (done) {
            assert.equal(route.match('/user/1/post/1', 'GET'), true);
            done();
        });
        it('Should return true for POST "/user/1/post/hello-world"', function (done) {
            assert.equal(route.match('/user/1/post/hello-world', 'POST'), false);
            done();
        });
        it('Should return false for GET "/user/kevin/post/hello-world"', function (done) {
            assert.equal(route.match('/user/kevin/post/hello-world', 'GET'), false);
            done();
        });
        it('Should return false for GET "/user/1/post"', function (done) {
            assert.equal(route.match('/user/1/post', 'GET'), false);
            done();
        });
        it('Should return false for GET "/user/1"', function (done) {
            assert.equal(route.match('/user/1', 'GET'), false);
            done();
        });
    });

    describe.only('.extractParamsFromUrl(url)', function () {
        it('Should return filled object for "/user/1/post/hello-world"', function (done) {
            var params = route.extractParamsFromUrl('/user/1/post/hello-world');
            assert.equal(params.userId, '1');
            assert.equal(params.postSlug, 'hello-world');
            done();
        });
    });
});
