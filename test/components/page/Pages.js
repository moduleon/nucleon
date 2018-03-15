var assert = require('assert');

describe('src/components/page/Pages', function () {

    // Create a virtual window, document for running tests.
    before(function () {
        require('../../jsdom-handler')();
    });

    describe.only('.add(name, config)', function () {
        it('should return a new Page instance', function (done) {
            var Page = require('../../../src/components/page/classes/Page');
            var pages = require('../../../src/components/page/Pages');
            var page = pages.add('New page', {
                route: '/new-page',
                fn: function () {}
            });
            assert.equal(true, pages.get('New page') instanceof Page);
            done();
        });
    });
});
