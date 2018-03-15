var assert = require('assert');

describe('src/components/property/PropertyAccessor', function () {

    var accessor = require('../../../src/components/property/PropertyAccessor');
    var obj = {};

    describe.only('.setPropertyValue(target, path, value)', function () {
        it('should set a value in target path', function (done) {
            accessor.setPropertyValue(obj, 'sub.prop', 1);
            assert.equal(obj.sub.prop, 1);
            done();
        });
    });

    describe.only('.getPropertyValue(target, path)', function () {
        it('should return value of target path', function (done) {
            assert.equal(accessor.getPropertyValue(obj, 'sub.prop'), 1);
            done();
        });
    });

    describe.only('.removeProperty(target, path)', function () {
        it('should remove target property', function (done) {
            accessor.removeProperty(obj, 'sub.prop');
            assert.equal(accessor.getPropertyValue(obj, 'sub.prop'), undefined);
            done();
        });
    });

    describe.only('.duplicateProperties(source, target)', function () {
        it('should return a duplicated object', function (done) {
            obj = {
                sub: {
                    prop: 1
                }
            };
            var copy = {};
            accessor.duplicateProperties(obj, copy);
            assert.equal(obj.sub.prop, copy.sub.prop);
            done();
        });
    });

    describe.only('.getTypeOf(value)', function () {
        it('should return a value type', function (done) {
            assert.equal(accessor.getTypeOf(10), 'number');
            assert.equal(accessor.getTypeOf(true), 'boolean');
            assert.equal(accessor.getTypeOf(false), 'boolean');
            assert.equal(accessor.getTypeOf([]), 'array');
            assert.equal(accessor.getTypeOf({}), 'object');
            assert.equal(accessor.getTypeOf('test'), 'string');
            assert.equal(accessor.getTypeOf(function () {}), 'function');
            assert.equal(accessor.getTypeOf(new Date()), 'date');
            assert.equal(accessor.getTypeOf(null), 'null');
            assert.equal(accessor.getTypeOf(undefined), 'undefined');
            done();
        });
    });

    describe.only('.redefineProperty(target, prop, getter, setter)', function () {
        it('should redefine an object getter and setter', function (done) {
            obj.prop = 1;
            var value = obj.prop;
            var oldValue = value;
            accessor.redefineProperty(
                obj,
                'prop',
                function () {
                    return value;
                },
                function (newValue) {
                    oldValue = value;
                    value = newValue;
                }
            );
            assert.equal(obj.prop, 1);
            obj.prop = 2;
            assert.equal(obj.prop, 2);
            done();
        });
    });
});
