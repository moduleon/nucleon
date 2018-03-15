var assert = require('assert');

describe('src/components/channel/Channel', function () {

    var channel = require('../../../src/components/channel/Channel');
    var calls = 0;
    var callback = function (value) {
        if ('transmitted' === value) {
            ++calls;
        }
    };

    describe.only('.on(event, callback)', function () {
        it('should register an event listener', function (done) {
            channel.on('custom_event', callback);
            done();
        });
    });

    describe.only('.trigger(event)', function () {
        it('should trigger an event listener', function (done) {
            channel.trigger('custom_event', 'transmitted');
            assert.equal(1, calls);
            done();
        });
    });

    describe.only('.off(event, callback)', function () {
        it('should unregister an event listener', function (done) {
            channel.off('custom_event', callback);
            assert.equal(1, calls);
            done();
        });
    });
});
