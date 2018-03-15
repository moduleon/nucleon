var assert = require('assert');

describe('src/components/model/classes/Collection', function () {

    var Collection = require('../../../../src/components/model/classes/Collection');
    var collection;
    var handler = function (event, changes) {
        callbacks[event]++;
    };
    var callbacks = {
        add: 0,
        remove: 0,
        change: 0
    };

    describe.only('new Collection(obj)', function () {
        it('Should return a new Collection instance', function (done) {
            collection = new Collection([1, 2, 3], handler);
            done();
        });
    });

    describe.only('.push(item)', function () {
        it('Should call "add" callback', function (done) {
            collection.push(4);
            assert(callbacks.add, 1);
            done();
        });
    });

    describe.only('.unshift(item)', function () {
        it('Should call "add" callback', function (done) {
            collection.unshift(0);
            assert(callbacks.add, 2);
            done();
        });
    });

    describe.only('.pop()', function () {
        it('Should call "remove" callback', function (done) {
            collection.pop();
            assert(callbacks.remove, 1);
            done();
        });
    });

    describe.only('.shift()', function () {
        it('Should call "remove" callback', function (done) {
            collection.shift();
            assert(callbacks.remove, 2);
            done();
        });
    });

    describe.only('.splice(index, number)', function () {
        it('Should call "remove" callback', function (done) {
            collection.splice(0, 1);
            assert(callbacks.remove, 3);
            done();
        });
    });

    describe.only('.reverse()', function () {
        it('Should call "change" callback', function (done) {
            collection.reverse();
            assert(callbacks.change, 1);
            done();
        });
    });

    describe.only('.sort()', function () {
        it('Should call "change" callback', function (done) {
            collection.sort(function (a, b) {
                return -1;
            });
            assert(callbacks.change, 2);
            done();
        });
    });
});
