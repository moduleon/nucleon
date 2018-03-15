var assert = require('assert');

describe('src/components/event/Events', function () {

    // Create a virtual window, document for running tests.
    before(function () {
        require('../../jsdom-handler')();
    });

    var events = require('../../../src/components/event/Events');
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
            events.on('click', '.target', callback);
            done();
        });
        it('should register multiple event with a selector', function (done) {
            events.on('keyup, keydown', '.target', callback);
            done();
        });
        it('should register an event with a html element', function (done) {
            events.on('input', el, callback);
            done();
        });
        it('should register multiple event with a html element', function (done) {
            events.on('focusin, focusout', el, callback);
            done();
        });
    });

    describe.only('.trigger(event, ref)', function () {
        it('should trigger an event for element matching with a selector', function (done) {
            events.trigger('click', '.target');
            assert.equal(1, calls);
            done();
        });
        it('should trigger multiple events for element matching with a selector', function (done) {
            events.trigger('keyup, keydown', '.target');
            assert.equal(3, calls);
            done();
        });
        it('should trigger an event for a html element', function (done) {
            events.trigger('input', el);
            assert.equal(4, calls);
            done();
        });
        it('should trigger multiple events for a html element', function (done) {
            events.trigger('focusin, focusout', el);
            assert.equal(6, calls);
            done();
        });
    });

    describe.only('.off(event, ref, callback)', function () {
        it('should remove an event with a selector', function (done) {
            events.off('click', '.target', callback);
            events.trigger('click', '.target');
            assert.equal(6, calls);
            done();
        });
        it('should remove multiple event with a selector', function (done) {
            events.off('keyup, keydown', '.target', callback);
            events.trigger('keyup, keydown', '.target');
            assert.equal(6, calls);
            done();
        });
        it('should remove an event with a html element', function (done) {
            events.off('input', el, callback);
            events.trigger('input', el);
            assert.equal(6, calls);
            done();
        });
        it('should remove multiple event with a html element', function (done) {
            events.off('focusin, focusout', el, callback);
            events.trigger('focusin, focusout', el);
            assert.equal(6, calls);
            done();
        });
    });

    describe.only('.clear()', function () {
        it('should remove all listeners using a selector', function (done) {
            events.on('click', '.target', callback);
            events.clear();
            events.trigger('click', '.target');
            assert.equal(6, calls);
            done();
        });
    });
});
