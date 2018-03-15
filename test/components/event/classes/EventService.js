var assert = require('assert');

describe('src/components/event/classes/EventService', function () {

    // Create a virtual window, document for running tests.
    before(function () {
        require('../../../jsdom-handler')();
    });

    var EventService = require('../../../../src/components/event/classes/EventService');
    var eventService = new EventService();
    var DOMManipulator = require('../../../../src/components/dom/DOMManipulator');
    var el;
    var calls = 0;
    var callback = function () {
        calls++;
    };

    describe.only('.on(event, ref, callback)', function () {
        it('should register an event with a selector', function (done) {
            el = DOMManipulator.createElement('<div class="target">Hello</div>');
            DOMManipulator.insertElement(el, DOMManipulator.first('body'));
            eventService.on('click', '.target', callback);
            done();
        });
        it('should register multiple event with a selector', function (done) {
            eventService.on('keyup, keydown', '.target', callback);
            done();
        });
        it('should register an event with a html element', function (done) {
            eventService.on('input', el, callback);
            done();
        });
        it('should register multiple event with a html element', function (done) {
            eventService.on('focusin, focusout', el, callback);
            done();
        });
    });

    describe.only('.trigger(event, ref)', function () {
        it('should trigger an event for element matching with a selector', function (done) {
            eventService.trigger('click', '.target');
            assert.equal(1, calls);
            done();
        });
        it('should trigger multiple events for element matching with a selector', function (done) {
            eventService.trigger('keyup, keydown', '.target');
            assert.equal(3, calls);
            done();
        });
        it('should trigger an event for a html element', function (done) {
            eventService.trigger('input', el);
            assert.equal(4, calls);
            done();
        });
        it('should trigger multiple events for a html element', function (done) {
            eventService.trigger('focusin, focusout', el);
            assert.equal(6, calls);
            done();
        });
    });

    describe.only('.off(event, ref, callback)', function () {
        it('should remove an event with a selector', function (done) {
            eventService.off('click', '.target', callback);
            eventService.trigger('click', '.target');
            assert.equal(6, calls);
            done();
        });
        it('should remove multiple event with a selector', function (done) {
            eventService.off('keyup, keydown', '.target', callback);
            eventService.trigger('keyup, keydown', '.target');
            assert.equal(6, calls);
            done();
        });
        it('should remove an event with a html element', function (done) {
            eventService.off('input', el, callback);
            eventService.trigger('input', el);
            assert.equal(6, calls);
            done();
        });
        it('should remove multiple event with a html element', function (done) {
            eventService.off('focusin, focusout', el, callback);
            eventService.trigger('focusin, focusout', el);
            assert.equal(6, calls);
            done();
        });
    });

    describe.only('.clear()', function () {
        it('should remove all listeners using a selector', function (done) {
            eventService.on('click', '.target', callback);
            eventService.clear();
            eventService.trigger('click', '.target');
            assert.equal(6, calls);
            done();
        });
    });
});
