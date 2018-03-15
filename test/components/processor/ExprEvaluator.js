var assert = require('assert');

describe('src/components/processor/ExprEvaluator', function () {

    var processor = require('../../../src/components/processor/ExprEvaluator');

    describe.only('.process(expr, context)', function () {

        it('should return good values', function (done) {

            // Define tests
            var tests = [
                {
                    expr: '!a',
                    context: {
                        a: false
                    },
                    result: true
                },
                {
                    expr: '!a && !b',
                    context: {
                        a: false,
                        b: true
                    },
                    result: false
                },
                {
                    expr: '!a || !b',
                    context: {
                        a: false,
                        b: true
                    },
                    result: true
                },
                // Mathematical ops
                {
                    expr: '2 + 1 - 1 * 2 / 2',
                    context: {},
                    result: 2
                },
                {
                    expr: '10 % 3',
                    context: {},
                    result: 1
                },
                {
                    expr: '((2 + 1) - (1 * 2)) / 2',
                    context: {},
                    result: 0.5
                },
                {
                    expr: '0 + 1',
                    context: {},
                    result: 1
                },
                {
                    expr: '+ 1',
                    context: {},
                    result: 1
                },
                {
                    expr: '0 > 1 ? false : true',
                    context: {},
                    result: true
                },
                {
                    expr: '0 > 1 ? "" : "string"',
                    context: {},
                    result: 'string'
                },
                {
                    expr: '0 > 1 ? "string" : ""',
                    context: {},
                    result: ''
                },
                // Prop references
                {
                    expr: '1 + a',
                    context: { a: 1 },
                    result: 2
                },
                {
                    expr: '1 + a.number',
                    context: {
                        a: {
                            number: 1
                        }
                    },
                    result: 2
                },
                {
                    expr: 'user.firstname + " " + user.lastname',
                    context: {
                        user: {
                            firstname: '',
                            lastname: 'Marcachi'
                        }
                    },
                    result: ' Marcachi'
                },
                {
                    expr: 'user.firstname + " " + user.lastname',
                    context: {
                        user: {
                            firstname: null,
                            lastname: 'Marcachi'
                        }
                    },
                    result: ' Marcachi'
                },
                // String
                {
                    expr: '"ab"',
                    context: {},
                    result: 'ab'
                },
                {
                    expr: '"a" + "b"',
                    context: {},
                    result: 'ab'
                },
                {
                    expr: '\'a\' + \'b\'',
                    context: {},
                    result: 'ab'
                },
                // Comparison ops
                {
                    expr: '(1 < 2 && 3 > 2) || 0 == 1',
                    context: {},
                    result: true
                },
                // Functions
                {
                    expr: 'double(2) + 3 == 7',
                    context: { double: function (nb) { return nb * 2; } },
                    result: true
                },
                {
                    expr: 'double(double(2)) == 8',
                    context: { double: function (nb) { return nb * 2; } },
                    result: true
                },
                {
                    expr: '(double(2) + 1) * 2',
                    context: { double: function (nb) { return nb * 2; } },
                    result: 10
                },
                {
                    expr: 'sum(2, 3)',
                    context: { sum: function (a, b) { return a + b; } },
                    result: 5
                },
                // Objects
                {
                    expr: 'test({"a":2})',
                    context: {
                        test: function (data) {
                            return data.a;
                        }
                    },
                    result: 2
                },
                {
                    expr: 'test({"slug":"hello-world"})',
                    context: {
                        test: function (data) {
                            return data.slug;
                        }
                    },
                    result: 'hello-world'
                },
                {
                    expr: 'test({"slug":obj.slug})',
                    context: {
                        test: function (data) {
                            return data.slug;
                        },
                        obj: {
                            slug: 'hello-world'
                        }
                    },
                    result: 'hello-world'
                },
                {
                    expr: 'a+" "+b',
                    context: {
                        a: 'Foo',
                        b: 'Bar',
                    },
                    result: 'Foo Bar'
                },
                // Arrays
                {
                    expr: 'count(["a","b","c"])',
                    context: {
                        count: function (ary) {
                            return ary.length;
                        }
                    },
                    result: 3
                },
                // Ternary ops
                {
                    expr: '(i + 1) == page ? true : false',
                    context: {
                        page: 1,
                        i: 0
                    },
                    result: true
                },
            ];

            // Run validation
            for (var i = 0, len = tests.length, result; i < len; i++) {
                result = processor.process(tests[i].expr, tests[i].context);
                try {
                    assert.equal(result, tests[i].result);
                } catch (e) {
                    throw new Error ('Returned value for expression "'+ tests[i].expr +'" should be "'+ tests[i].result +'", not "'+result+'"');
                }
            }

            done();
        });
    });
});
