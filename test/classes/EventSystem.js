var assert = require('assert');

describe('src/classes/EventSystem', function () {

    var eventSystem;
    var calls = 0;
    var callback = function (value) {
        calls++;
    };

    describe.only('new EventSystem()', function () {
        it('should return an instance of EventSystem', function (done) {
            var EventSystem = require('../../src/classes/EventSystem');
            eventSystem = new EventSystem();
            assert.equal(true, eventSystem instanceof EventSystem);
            done();
        });
    });

    describe.only('.on(event, target, callback)', function () {
        it('should register a new event listener', function (done) {
            eventSystem.on('custom', 'target', callback);
            done();
        });
    });

    describe.only('.trigger(event, target)', function () {
        it('should trigger an event listener', function (done) {
            eventSystem.trigger('custom', 'target');
            assert.equal(1, calls);
            done();
        });
    });

    describe.only('.off(event, target, callback)', function () {
        it('should unregister an event listener', function (done) {
            eventSystem.off('custom', 'target', callback);
            eventSystem.trigger('custom', 'target');
            assert.equal(1, calls);
            done();
        });
    });

    describe.only('.clear()', function () {
        it('should remove all event listeners', function (done) {
            eventSystem.on('custom', 'target', callback);
            eventSystem.clear();
            assert.equal(1, calls);
            done();
        });
    });
});
