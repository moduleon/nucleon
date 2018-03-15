var assert = require('assert');

describe.skip('src/component/http/Redirect', function () {

    // Create a virtual window, document for running tests.
    before(function () {
        require('../../jsdom-handler')({
            url: 'http://localhost'
        });
    });

    it.only('Should redirect to a controller action if there is one matching', function (done) {
        var calls = 0;
        var controllers = require('../../../src/components/controller/Controllers');
        controllers
            .add('TestController')
            .addAction({
                name: 'indexAction',
                route: '/test',
                fn: function () {
                    calls++;
                }
            })
        ;

        var redirect = require('../../../src/components/http/Redirect');
        redirect('/test');

        assert.equal(calls, 1);

        done();
    });
});
