var assert = require('assert');

describe.skip('src/components/event/InnerEvents', function () {

    // Create a virtual window, document for running tests.
    before(function () {
        require('../../jsdom-handler')();
    });

    var innerEvents = require('../../../src/components/event/InnerEvents');
    var DOMManipulator = require('../../../src/components/dom/DOMManipulator');
    var el;
    var calls = 0;
    var callback = function () {
        calls++;
    };

    describe.only('.on(event, ref, callback)', function () {
        it('should register an event with a selector', function (done) {
            el = DOMManipulator.createElement('<div class="target">Hello</div>');
            DOMManipulator.insertElement(el, DOMManipulator.first('body'));
            innerEvents.on('click', '.target', callback);
            done();
        });
        it('should register multiple event with a selector', function (done) {
            innerEvents.on('keyup, keydown', '.target', callback);
            done();
        });
        it('should register an event with a html element', function (done) {
            innerEvents.on('input', el, callback);
            done();
        });
        it('should register multiple event with a html element', function (done) {
            innerEvents.on('focusin, focusout', el, callback);
            done();
        });
    });

    describe.only('.trigger(event, ref)', function () {
        it('should trigger an event for element matching with a selector', function (done) {
            innerEvents.trigger('click', '.target');
            assert.equal(1, calls);
            done();
        });
        it('should trigger multiple innerEvents for element matching with a selector', function (done) {
            innerEvents.trigger('keyup, keydown', '.target');
            assert.equal(3, calls);
            done();
        });
        it('should trigger an event for a html element', function (done) {
            innerEvents.trigger('input', el);
            assert.equal(4, calls);
            done();
        });
        it('should trigger multiple innerEvents for a html element', function (done) {
            innerEvents.trigger('focusin, focusout', el);
            assert.equal(6, calls);
            done();
        });
    });

    describe.only('.off(event, ref, callback)', function () {
        it('should remove an event with a selector', function (done) {
            innerEvents.off('click', '.target', callback);
            innerEvents.trigger('click', '.target');
            assert.equal(6, calls);
            done();
        });
        it('should remove multiple event with a selector', function (done) {
            innerEvents.off('keyup, keydown', '.target', callback);
            innerEvents.trigger('keyup, keydown', '.target');
            assert.equal(6, calls);
            done();
        });
        it('should remove an event with a html element', function (done) {
            innerEvents.off('input', el, callback);
            innerEvents.trigger('input', el);
            assert.equal(6, calls);
            done();
        });
        it('should remove multiple event with a html element', function (done) {
            innerEvents.off('focusin, focusout', el, callback);
            innerEvents.trigger('focusin, focusout', el);
            assert.equal(6, calls);
            done();
        });
    });

    describe.only('.clear()', function () {
        it('should remove all listeners using a selector', function (done) {
            innerEvents.on('click', '.target', callback);
            innerEvents.clear();
            innerEvents.trigger('click', '.target');
            assert.equal(6, calls);
            done();
        });
    });
});
