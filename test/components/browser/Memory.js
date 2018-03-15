var assert = require('assert');

describe('src/components/browser/Memory', function () {

    // Create a virtual window, document for running tests.
    before(function () {
        require('../../jsdom-handler')();
    });

    var memory;

    describe.only('.set(name, value)', function () {
        it('should set a value for a given property name', function (done) {
            memory = require('../../../src/components/browser/Memory');
            memory.set('prop', 1);
            done();
        });
    });

    describe.only('.get(name)', function () {
        it('should set value for a given property name', function (done) {
            assert.equal(1, memory.get('prop'));
            done();
        });
    });

    describe.only('.all()', function () {
        it('should return an object containing all set values', function (done) {
            var all = memory.all()
            assert.equal(true, all instanceof Object);
            assert.equal(1, all.prop);
            done();
        });
    });

    describe.only('.remove(name)', function () {
        it('should remove a value for a given property name', function (done) {
            memory.remove('prop');
            assert.equal(undefined, memory.get('prop'));
            done();
        });
    });

    describe.only('.clear()', function () {
        it('should remove all values', function (done) {
            memory.set('prop', 1);
            memory.clear();
            assert.equal(undefined, memory.get('prop'));
            done();
        });
    });
});
