/**
 * ExprEvaluator returns a value for a given string expression and context object.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var ExprEvaluator = function () {

    'use strict';

    // Const
    var ARRAY_START = '[';
    var ARRAY_END = ']';
    var COMMA = ',';
    var DOUBLE_QUOTE = '"';
    var DOUBLE_DOT = ':';
    var ESCAPER = '\\';
    var OBJECT_START = '{';
    var OBJECT_END = '}';
    var PAREN_START = '(';
    var PAREN_END = ')';
    var SINGLE_QUOTE = "'";
    var SPACE = ' ';

    // Private functions
    var symbols = {
        // ===== NOT ops
        '!' : function (idx, ary) { return !ary[idx + 1]; },
        // ===== Mathematical ops
        '*' : function (idx, ary) { return ary[idx - 1] * ary[idx + 1]; },
        '/' : function (idx, ary) { return ary[idx - 1] / ary[idx + 1]; },
        '%' : function (idx, ary) { return ary[idx - 1] % ary[idx + 1]; },
        '-' : function (idx, ary) { return (ary[idx - 1] || 0) - ary[idx + 1]; },
        '+' : function (idx, ary) {
            var a = ary[idx - 1] !== undefined ? ary[idx - 1] : 0;
            if (null === a) {
                a = '';
            }
            var b = ary[idx + 1] !== undefined ? ary[idx + 1] : 0;
            if (null === b) {
                b = '';
            }
            return a + b;
        },
        // ===== Comparison ops
        '!=': function (idx, ary) { return ary[idx - 1] !== ary[idx + 1]; },
        '==': function (idx, ary) { return ary[idx - 1] === ary[idx + 1]; },
        '>' : function (idx, ary) { return ary[idx - 1] >   ary[idx + 1]; },
        '>=': function (idx, ary) { return ary[idx - 1] >=  ary[idx + 1]; },
        '<' : function (idx, ary) { return ary[idx - 1] <   ary[idx + 1]; },
        '<=': function (idx, ary) { return ary[idx - 1] <=  ary[idx + 1]; },
        // ===== Boolean ops
        '&&': function (idx, ary) { return ary[idx - 1] && ary[idx + 1]; },
        '||': function (idx, ary) { return ary[idx - 1] || ary[idx + 1]; },
        // ===== Ternary ops
        '?' : function (idx, ary) {
            var first = ':' === ary[idx + 1] ? '' : ary[idx + 1];
            var second = undefined === ary[idx + 3] ? (':' === ary[idx + 2] ? '' : ary[idx + 2]) : ary[idx + 3];
            return ary[idx - 1] ? first : second;
        }
    };

    // Private vars
    var index;
    var components;
    var inSingleQuote;
    var inDoubleQuote;
    var inEscaper;
    var inSymbol;
    var openObjects;
    var openArrays;
    var symbolsUsed;
    var newRow;
    var evaluate;
    var openIndexes;

    /**
     * Return value for given expression and context.
     *
     * @param  {string} expr
     * @param  {object} context
     *
     * @return {mixed}
     */
    this.process = function (expr, context, replaceUndefined) {
        replaceUndefined = undefined === replaceUndefined ? true : replaceUndefined;
        index = 0;
        components = [''];
        inSingleQuote = false;
        inDoubleQuote = false;
        inEscaper = false;
        inSymbol = false;
        openObjects = 0;
        openArrays = 0;
        symbolsUsed = {};
        newRow = false;
        evaluate = false;
        openIndexes = [];

        function toggle (value) {
            return true !== value;
        }

        function addOpenIndex (i) {
            openIndexes.push(i);
        }

        function getLastOpenIndex () {
            return openIndexes.pop();
        }

        function inQuotes () {
            return inSingleQuote || inDoubleQuote;
        }

        function isFunction (string) {
            return /^[a-z.]+\(/i.test(string);
        }

        function isSymbol (string) {
            return undefined !== symbols[string];
        }

        function addInRow (k) {
            if (newRow) {
                index++;
                components[index] = '';
                newRow = false;
            }
            components[index] += k;
        }

        function inNewRow (k) {
            prepareNewRow();
            addInRow(k);
        }

        function prepareNewRow () {
            if ('' !== components[index]) {
                newRow = true;
            }
            if (true === evaluate) {
                components[index] = stringToValue(components[index]);
                evaluate = false;
            }
        }

        function accessProperty (path, params) {
            var fragments = path.split('.');
            if (!context || undefined === context[fragments[0]]) {
                return replaceUndefined ? undefined : path;
            }
            var target = context;
            var owner = target;
            var i;
            var len = fragments.length;
            for (i = 0; i < len; ++i) {
                if (undefined !== target[fragments[i]]) {
                    owner = target;
                    target = target[fragments[i]];
                } else {
                    return replaceUndefined ? undefined : path;
                }
            }
            if (typeof target === 'function') {
                target = target.apply(owner, params);
            }

            return target;
        }

        function stringToValue (string) {
            switch (string) {
                case 'undefined': return undefined;
                case 'null'     : return null;
                case 'false'    : return false;
                case 'true'     : return true;
                default         : return isNaN(string) ? accessProperty(string) : parseFloat(string);
            }
        }

        function processFunction (start, end) {
            components.splice(end, 1);
            var fxName = components[start].substring(0, components[start].length - 1);
            var innerComponents = components.splice(start + 1, end);
            processSymbols(innerComponents);
            var params = innerComponents.filter((function (k) {
                return k !== COMMA;
            }));
            components[start] = accessProperty(fxName, params);
            index = start;
        }

        function processParenthesis (start, end) {
            var innerComponents = components.splice(start + 1, end - start - 1);
            processSymbols(innerComponents);
            components.splice(start, 2, innerComponents[0]);
            index = start;
        }

        function processObject (start, end) {
            for (var i = start; i < end; ++i) {
                if (
                    '{' !== components[i] && ':' !== components[i] && '}' !== components[i] && ',' !== components[i] && '[' !== components[i] && ']' !== components[i]
                    && (isNaN(parseFloat(components[i])) || !isFinite(components[i]))
                ) {
                    components[i] = '"'+components[i]+'"';
                }
            }
            var portion  = components.splice(start, (end - start + 1));
            var object = JSON.parse(portion.join(''));
            components[start] = object;
            index = start;
        }

        function processSymbols (ary) {
            ary = ary || components;
            var start;
            var range;
            var value;
            var symbol;
            var idx;
            for (symbol in symbols) {
                if (undefined === symbolsUsed[symbol]) {
                    continue;
                }
                while ((idx = ary.indexOf(symbol)) > -1) {
                    if (symbol === '?') {
                        start = idx - 1;
                        range = 5;
                    } else if (symbol === '!') {
                        start = idx;
                        range = 2;
                    } else {
                        start = (idx - 1) >= 0 ? (idx - 1) : idx;
                        range = (index === start) ? 2 : 3;
                    }
                    value = symbols[symbol](idx, ary);
                    ary.splice(start, range, value);
                }
            }
        }

        var i;
        var len = expr.length;
        var k;
        for (i = 0; i < len; ++i) {
            k = expr[i];
            switch (k) {
                case DOUBLE_QUOTE:
                    if (!inSingleQuote && !inEscaper) {
                        inDoubleQuote = toggle(inDoubleQuote);
                        if (!inDoubleQuote || inSymbol) {
                            prepareNewRow();
                        }
                        continue;
                    }
                    evaluate = false;
                    addInRow(k);
                break;
                case SINGLE_QUOTE:
                    if (!inDoubleQuote && !inEscaper) {
                        inSingleQuote = toggle(inSingleQuote);
                        if (!inSingleQuote || inSymbol) {
                            prepareNewRow();
                        }
                        continue;
                    }
                    evaluate = false;
                    addInRow(k);
                break;
                case ESCAPER:
                    inEscaper = toggle(inEscaper);
                    if (inEscaper) {
                        continue;
                    }
                    addInRow(k);
                break;
                default:
                    if (inQuotes()) {
                        addInRow(k);
                    } else {
                        switch (k) {
                            case SPACE:
                                prepareNewRow();
                            break;
                            case COMMA:
                            case DOUBLE_DOT:
                                inNewRow(k);
                                prepareNewRow();
                            break;
                            case ARRAY_START:
                                inNewRow(k);
                                prepareNewRow();
                                if (0 === openArrays + openObjects) {
                                    addOpenIndex(index);
                                }
                                ++openArrays;
                            break;
                            case ARRAY_END:
                                inNewRow(k);
                                prepareNewRow();
                                --openArrays;
                                if (0 === openArrays + openObjects) {
                                    processObject(getLastOpenIndex(), index);
                                }
                            break;
                            case OBJECT_START:
                                inNewRow(k);
                                prepareNewRow();
                                if (0 === openArrays + openObjects) {
                                    addOpenIndex(index);
                                }
                                ++openObjects;
                            break;
                            case OBJECT_END:
                                inNewRow(k);
                                prepareNewRow();
                                --openObjects;
                                if (0 === openArrays + openObjects) {
                                    processObject(getLastOpenIndex(), index);
                                }
                            break;
                            case PAREN_START:
                                if (isFunction(components[index] + k)) {
                                    evaluate = false;
                                } else {
                                    prepareNewRow();
                                }
                                addInRow(k);
                                prepareNewRow();
                                addOpenIndex(index);
                            break;
                            case PAREN_END:
                                inNewRow(k);
                                prepareNewRow();
                                var lastEntry = getLastOpenIndex();
                                if (isFunction(components[lastEntry])) {
                                    processFunction(lastEntry, index);
                                } else {
                                    processParenthesis(lastEntry, index);
                                }
                            break;
                            default:
                                if (isSymbol(components[index] + k)) {
                                    inSymbol = true;
                                    evaluate = false;
                                    symbolsUsed[components[index] + k] = true;
                                } else if (isSymbol(k)) {
                                    if (!inSymbol) {
                                        prepareNewRow();
                                    }
                                    inSymbol = true;
                                    evaluate = false;
                                    symbolsUsed[k] = true;
                                } else if (inSymbol) {
                                    prepareNewRow();
                                    inSymbol = false;
                                    evaluate = true;
                                    symbolsUsed[components[index]] = true;
                                } else {
                                    evaluate = true;
                                }
                                addInRow(k);
                            break;
                        }
                    }
                break;
            }
        }

        if (evaluate) {
            components[index] = stringToValue(components[index]);
        }

        processSymbols(components);

        if (components.length > 1) {
            throw new Error('Invalid expression "'+expr+'".');
        }

        return components[0];
    };
};

module.exports = new ExprEvaluator();
