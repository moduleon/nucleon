describe('src/components/browser/History', function () {

    // Create a virtual window, document for running tests.
    before(function () {
        require('../../jsdom-handler')({
            url: 'http://localhost'
        });
    });

    describe.only('.addEntry(url, callback)', function () {
        it('should update url and register a callback', function (done) {
            var history = require('../../../src/components/browser/History');
            history.addEntry('/path', function () {});
            done();
        });
    });
});
