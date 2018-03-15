var assert = require('assert');

describe('src/components/model/Models', function () {

    var Model = require('../../../src/components/model/classes/Model');
    var models = require('../../../src/components/model/Models');

    describe.only('.add(name, obj)', function () {
        it('Should create and return a new Model instance', function (done) {
            var model = models.add('test', {
                prop: 'value'
            });
            assert.equal(true, model instanceof Model);
            done();
        });
    });

    describe.only('.get(name)', function () {
        it('Should return a Model instance', function (done) {
            var model = models.get('test');
            assert.equal(true, model instanceof Model);
            done();
        });
    });
});
