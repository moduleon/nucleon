var assert = require('assert');

describe('src/components/view/Views', function () {

    // Create a virtual window, document for running tests.
    before(function () {
        require('../../jsdom-handler')();
    });

    var views = require('../../../src/components/view/Views');

    describe.only('.add(name, obj)', function () {
        it('Should create and return a new View instance', function (done) {
            var root = document.createElement('div');
            root.id = 'app';
            document.getElementsByTagName('body')[0].appendChild(root);
            var view = views.add('test', {
                root: '#app',
                template: '<div></div>'
            });
            var View = require('../../../src/components/view/classes/View');
            assert.equal(true, view instanceof View);
            done();
        });
    });

    describe.only('.get(name)', function () {
        it('Should return a View instance', function (done) {
            var view = views.get('test');
            var View = require('../../../src/components/view/classes/View');
            assert.equal(true, view instanceof View);
            done();
        });
    });

    describe.only('.render(name)', function () {
        it('Should render a View instance', function (done) {
            var view = views.render('test');
            done();
        });
    });

    describe.only('.revoke(name)', function () {
        it('Should revoke a View instance', function (done) {
            var view = views.revoke('test');
            done();
        });
    });
});
