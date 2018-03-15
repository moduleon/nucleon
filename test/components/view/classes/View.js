var assert = require('assert');

describe('src/components/view/classes/View', function () {

    // Create a virtual window, document for running tests.
    before(function() {
        require('../../../jsdom-handler')();
    });

    var View = require('../../../../src/components/view/classes/View');
    var view;

    describe.only('new View(config)', function () {
        it('Should return a new View instance', function (done) {
            // Include container in document
            var container = document.createElement('div');
            container.id = 'app';
            document.getElementsByTagName('body')[0].appendChild(container);
            // Create the view
            view = new View({
                root: '#app',
                template: '<div id="test"></div>'
            });
            assert.equal(view instanceof View, true);
            done();
        });
    });

    describe.only('.render()', function () {
        it('Should include view template', function (done) {
            view.render();
            assert.notEqual(document.getElementById('test'), null);
            done();
        });
    });

    describe.only('.revoke()', function () {
        it('Should remove view template', function (done) {
            view.revoke();
            assert.equal(document.getElementById('test'), null);
            done();
        });
    });
});
