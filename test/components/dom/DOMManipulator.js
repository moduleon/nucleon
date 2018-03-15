var assert = require('assert');

describe('src/components/dom/DOMManipulator', function () {

    // Create a virtual window, document for running tests
    before(function () {
        require('../../jsdom-handler')();
    });

    // Initialized shared values
    var DOMManipulator = require('../../../src/components/dom/DOMManipulator');
    var el, els;

    describe.only('.createElement(string)', function () {

        it('should return an html element', function (done) {
            el = DOMManipulator.createElement('<div class="lost">Alone</div>');
            assert.equal(true, (el instanceof HTMLElement));
            done();
        });
        it('should return a document fragment', function (done) {
            els = DOMManipulator.createElement('<div>Twin</div><div>Twin</div>');
            assert.equal(true, (els instanceof DocumentFragment));
            done();
        });
    });

    describe.only('.insertElement(element, target)', function () {
        it('should insert an element', function (done) {
            DOMManipulator.insertElement(el, document.documentElement);
            assert.equal(document.documentElement, el.parentNode);
            done();
        });
    });

    describe.only('.insertElements(elements, target)', function () {
        it('should insert multiple elements', function (done) {
            DOMManipulator.insertElements(els, document.documentElement);
            assert.equal(2, document.childNodes.length);
            done();
        });
    });

    describe.only('.removeElement(element)', function () {
        it('should remove an element from its parent node', function (done) {
            DOMManipulator.removeElement(el);
            assert.equal(null, el.parentNode);
            done();
        });
    });

    describe.only('.putAsideElement(element) & .putBackElement(element)', function () {
        it('should allow to put an element aside from its parent node and put it back', function (done) {
            DOMManipulator.insertElement(el, document.documentElement);
            DOMManipulator.putAsideElement(el);
            DOMManipulator.putBackElement(el);
            assert.equal(document.documentElement, el.parentNode);
            done();
        });
    });

    describe.only('.find(selector)', function () {
        it('should return an array', function (done) {
            var results = DOMManipulator.find('.lost');
            assert.equal(true, results instanceof Array);
            assert.equal(true, results[0] === el);
            done();
        });
    });

    describe.only('.first(selector)', function () {
        it('should return an element', function (done) {
            var result = DOMManipulator.first('.lost');
            assert.equal(true, result === el);
            done();
        });
    });

    describe.only('.isMatching(selector, element)', function () {
        it('should return good value', function (done) {
            var wrong = DOMManipulator.isMatching('.twin', el);
            assert.equal(false, wrong);
            var right = DOMManipulator.isMatching('.lost', el);
            assert.equal(true, right);
            done();
        });
    });
});
