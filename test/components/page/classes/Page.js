var assert = require('assert');

describe('src/components/page/classes/Page', function () {

    // Create a virtual window, document for running tests.
    before(function () {
        require('../../../jsdom-handler')();
    });

    var page;
    var calls = 0;

    describe.only('new Page(config)', function () {
        it('should return a new Page instance', function (done) {
            var Page = require('../../../../src/components/page/classes/Page');
            page = new Page({
                name: 'test',
                route: '/test',
                fn: function (request) {
                    calls++;
                }
            });
            assert.equal(true, page instanceof Page);
            done();
        });
    });

    describe.only('.run(request, storeInHistory)', function () {
        it('should execute bound function', function (done) {
            page.run({}, false);
            assert.equal(1, calls);
            done();
        });
    });
});
