var assert = require('assert');

describe('src/components/http/classes/Request', function () {

    // Create a virtual window, document for running tests.
    before(function () {
        require('../../../jsdom-handler')();
    });

    var request;
    var Request = require('../../../../src/components/http/classes/Request');
    var Route = require('../../../../src/components/routing/classes/Route');
    var DOMManipulator = require('../../../../src/components/dom/DOMManipulator');

    describe.only('new Request(config)', function () {
        it('Should return a new Request instance', function (done) {
            var event = {
                target: {
                    href: 'http://localhost/user/1/post/hello-world?p=1#post_1',
                    tagName: 'a'
                }
            };
            var route = new Route({
                name: 'user_post_details',
                path: '/user/{userId}/post/{postSlug}',
                params: {
                    userId: 'number',
                    postSlug: 'slug'
                }
            });
            request = new Request({ event: event, route: route });
            assert.equal(true, request instanceof Request);
            done();
        });
    });

    describe.only('.getEvent()', function () {
        it('Should return a DOM event', function (done) {
            assert.notEqual(null, request.getEvent());
            done();
        });
    });

    describe.only('.getProtocol()', function () {
        it('Should return request protocol', function (done) {
            assert.equal('http', request.getProtocol());
            done();
        });
    });

    describe.only('.getHost()', function () {
        it('Should return requested host', function (done) {
            assert.equal('localhost', request.getHost());
            done();
        });
    });

    describe.only('.getPath()', function () {
        it('Should return requested path', function (done) {
            assert.equal('/user/1/post/hello-world', request.getPath());
            done();
        });
    });

    describe.only('.getPort()', function () {
        it('Should return requested port', function (done) {
            assert.equal(80, request.getPort());
            done();
        });
    });

    describe.only('.getMethod()', function () {
        it('Should return http method used', function (done) {
            assert.equal('GET', request.getMethod());
            done();
        });
    });

    describe.only('.getHash()', function () {
        it('Should return hash contained in url if provided', function (done) {
            assert.equal('#post_1', request.getHash());
            done();
        });
    });

    describe.only('.getUriComponents()', function () {
        it('Should return route components', function (done) {
            assert.equal('1', request.getUriComponents()['userId']);
            assert.equal('hello-world', request.getUriComponents()['postSlug']);
            done();
        });
    });

    describe.only('.getQueryParams()', function () {
        it('Should return query parameters', function (done) {
            assert.equal('1', request.getQueryParams()['p']);
            done();
        });
    });

    describe.only('.getPostParams()', function () {
        it('Should return post parameters', function (done) {
            var form = DOMManipulator.createElement(
                '<form action="/user/1/post/hello-world/edit" method="POST">'+
                    '<input type="text" name="title" value="This is a title" />'+
                    '<textarea name="content">This is a modified post content</textarea>'+
                '</form>'
            );
            var event = {
                target: form
            };
            var route = new Route({
                name: 'user_post_edit',
                path: '/user/{userId}/post/{postSlug}/edit',
                method:'POST',
                params: {
                    userId: 'number',
                    postSlug: 'slug'
                }
            });
            request = new Request({ event: event, route: route });
            assert.equal('This is a title', request.getPostParams()['title']);
            assert.equal('This is a modified post content', request.getPostParams()['content']);
            done();
        });
    });
 });
