var assert = require('assert');

describe('src/components/model/classes/Model', function () {

    var Model = require('../../../../src/components/model/classes/Model');
    var model;

    describe.only('new Model(obj)', function () {
        it('Should return a new Model instance', function (done) {
            model = new Model({
                'prop': null,
                'setProp': function (value) {
                    this.prop = value;
                },
                'ary': [1, 2, 3],
                'collection': [
                    { prop: 'text' }
                ],
                'object': {
                    'prop': 'text value',
                    'subOject': {
                        'prop': 'value'
                    }
                }
            });
            assert.equal(true, model instanceof Model);
            done();
        });
    });

    describe.only('Changing properties values', function () {

        it('Should trigger an event', function (done) {

            var callbacks = 0;
            var expected = 0;

            function addTest(test) {
                test();
                expected++;
            }

            // Simple prop
            // ===========

            // Change prop value
            addTest(function () {
                model.on('change', 'prop', function (newValue, oldValue) {
                    if (2 === newValue && 2 === model.prop && null === oldValue) {
                        callbacks++;
                    }
                });
                model.prop = 2;
            });

            // Array with simple props
            // =======================

            // Add an item
            var item = 4;
            addTest(function () {
                model.on('add', 'ary', function (added) {
                    if (item === added) {
                        callbacks++;
                    }
                });
                model.ary.push(item);
            });

            // Change value of an item
            var newItemValue = 5;
            addTest(function () {
                model.on('change', 'ary.3', function (newValue, oldValue) {
                    if (newItemValue === newValue && item === oldValue) {
                        callbacks++;
                    }
                });
                model.ary[3] = newItemValue;
            });

            // Remove an item
            addTest(function () {
                model.on('remove', 'ary', function (removed) {
                    if (newItemValue === removed[0]) {
                        callbacks++;
                    }
                });
                model.ary.splice(model.ary.indexOf(newItemValue), 1);
            });

            // Replace ary
            var newAry = ['a', 'b', 'c'];
            addTest(function () {
                model.on('change', 'ary', function (newValue) {
                    if (newAry === newValue) {
                        callbacks++;
                    }
                });
                model.ary = newAry;
            });

            // Retry add an item
            item = 'd';
            addTest(function () {
                // > Listener already set
                model.ary.push(item);
            });

            // Retry change item prop
            newItemValue = 'e';
            addTest(function () {
                // > Listener already set
                model.ary[3] = newItemValue;
            });

            // Retry remove an item
            addTest(function () {
                // > Listener already set
                model.ary.splice(model.ary.indexOf(newItemValue), 1);
            });

            // Array containing objects
            // ========================

            // Add an object
            item = { prop: 'another text' };
            addTest(function () {
                model.on('add', 'collection', function (newValue) {
                    if (item === newValue) {
                        callbacks++;
                    }
                });
                model.collection.push(item);
            });

            // Change value of an added object
            var oldPropValue = model.collection[1].prop;
            var newPropValue = 'another text changed';
            addTest(function () {
                model.on('change', 'collection.1.prop', function (newValue, oldValue) {
                    if (newPropValue === newValue && oldPropValue === oldValue) {
                        callbacks++;
                    }
                });
                model.collection[1].prop = newPropValue;
            });

            // Remove an item
            addTest(function () {
                model.on('remove', 'collection', function (removed) {
                    if (item === removed[0]) {
                        callbacks++;
                    }
                });
                model.collection.splice(model.collection.indexOf(item), 1);
            });

            // Replace the collection
            var oldCollection = model.collection;
            var newCollection = [
                { prop: 'something totally different' }
            ];
            addTest(function () {
                model.on('change', 'collection', function (newValue, oldValue) {
                    if (newCollection === newValue && oldCollection === oldValue) {
                        callbacks++;
                    }
                });
                model.collection = newCollection;
            });

            // Check
            assert.equal(expected, callbacks);

            done();
        });
    });
});
