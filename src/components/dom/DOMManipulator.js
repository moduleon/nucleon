/**
 * DOMManipulator gives a api to perform CRUD operations on DOM.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var DOMManipulator = function () {
    this._locations = [];
};

DOMManipulator.prototype = {

    _locations: null,

    _escapeNestedQuotes: function (string) {
        var escaped = '';
        var inTag = false;
        var openQuotes = 0;
        for (var i = 0, len = string.length, k; i < len; ++i) {
            k = string[i];
            if ('<' === k && false === inTag && 0 === openQuotes) {
                inTag = true;
            }
            if ('>' === k && true === inTag && 0 === openQuotes) {
                inTag = false;
            }
            if ('"' === k && inTag) {
                ++openQuotes;
                if (openQuotes > 1) {
                    if (0 !== openQuotes % 2 || (0 === openQuotes % 2 && (' ' === string[i + 1] || '>' === string[i + 1]))) {
                        openQuotes -= 2;
                    }
                    if (openQuotes > 0) {
                        k = '&quot;';
                    }
                }
            }
            escaped += k;
        }

        return escaped;
    },

    _escapeCodeTags: function (string) {
        var ALL_TAGS_PATTERN = /<code[ a-z"'-_=|]*>(?:(?!<code).|[\r\n])*<\/code>/gi;
        var codes = string.match(ALL_TAGS_PATTERN);
        if (codes) {
            var INNER_TAG_PATTERN  = /<code[ a-z"'-_=|]*>((?:(?!<code).|[\r\n])*)<\/code>/i;
            for (var i = 0, len = codes.length, inner, escaped; i < len; ++i) {
                inner = codes[i].match(INNER_TAG_PATTERN)[1];
                escaped = codes[i].replace(inner, inner.replace(/</g, '&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'));
                string = string.replace(codes[i], escaped);
            }
        }

        return string;
    },

    _escapeSelector: function (selector) {
        return selector
            .replace(/#([0-9])/g, '#\\3$1 ')               // for browsers generating error when id start with a number
            .replace(/:+((?!not)[^: ]*)/g, '[type="$1"]'); // for browsers generating error when using ':' as element type selector
    },

    _removeComments: function (string) {
        var COMMENTS_PATTERN = /<!--[^>]*-->/gi;
        string = string.replace(COMMENTS_PATTERN, '');

        return string;
    },

    /**
     * Create an element from string.
     *
     * @param  {string} string
     *
     * @return {HTMLElement|DocumentFramgent}
     */
    createElement: function (string) {
        // Clean html
        string = string.trim();
        string = this._removeComments(string);
        string = this._escapeCodeTags(string);
        string = this._escapeNestedQuotes(string);

        // Turn string into html elements
        var el = null;
        var temp = document.createElement('temp');
        temp.innerHTML = string;

        // Return element directly if alone
        if (temp.childNodes.length === 1) {
            el = temp.firstChild.cloneNode(true);

        // Return document fragment if multiple elements
        } else if (temp.childNodes.length > 1) {
            el = document.createDocumentFragment();
            for (var i = 0, len = temp.childNodes.length; i < len; ++i) {
                el.appendChild(temp.childNodes[i].cloneNode(true));
            }
        }

        temp = null;

        return el;
    },

    /**
     * Insert an element in another.
     *
     * @param  {HTMLElement}        element
     * @param  {HTMLElement}        target
     * @param  {undefined|integer}  position
     */
    insertElement: function (element, target, position) {
        if (element.getAttribute('outside-dom')) {
            return;
        }
        var fragment = document.createDocumentFragment();
        fragment.appendChild(element);
        this.insertInPosition(fragment, target, position);
    },

    /**
     * Insert multiple elements in another.
     *
     * @param  {Array}              elements
     * @param  {HTMLElement}        target
     * @param  {undefined|integer}  position
     */
    insertElements: function (elements, target, position) {
        var fragment = document.createDocumentFragment();
        for (var i = 0, len = elements.length; i < len; ++i) {
            if (elements[i].getAttribute('outside-dom')) {
                continue;
            }
            fragment.appendChild(elements[i]);
        }
        this.insertInPosition(fragment, target, position);
    },

    /**
     * Insert element in a given position.
     *
     * @param  {DocumentFragment|HTMLElement} element
     * @param  {HTMLElement}                  target
     * @param  {undefined|integer}            position
     */
    insertInPosition: function (element, target, position) {
        if (position >= 0 && target.childNodes[position] && target.childNodes[position].parentNode) {
            target.insertBefore(element, target.childNodes[position]);
        } else {
            target.appendChild(element);
        }
    },

    /**
     * Insert an element in its last known location.
     *
     * @param  {HTMLElement} element
     */
    putBackElement: function (element) {
        if (null !== element.parentNode || !element.getAttribute('outside-dom')) {
            return;
        }
        for (var i = 0, len = this._locations.length, location; i < len; ++i) {
            if (this._locations[i].element !== element) {
                continue;
            }
            location = this._locations[i];
            // Next sibling still in position, insert element before it
            if (location.next && location.next.parentNode === location.parent) {
                location.parent.insertBefore(element, location.next);
            // Previous sibling still in position, insert element after it
            } else if (location.prev && location.prev.parentNode === location.parent) {
                if (location.prev.nextSibling) {
                    location.parent.insertBefore(element, location.prev.nextSibling);
                } else {
                    location.parent.appendChild(location.element);
                }
            // Parent empty, or position number is too big, just append element in parent
            } else if (0 === location.parent.childNodes.length || location.parent.childNodes.length < location.position) {
                location.parent.appendChild(location.element);
            // Elsewise, use position to insert element
            } else {
                location.parent.insertBefore(element, location.parent.childNodes[location.position]);
            }
            element.removeAttribute('outside-dom');
            this._locations.splice(i, 1);
            break;
        }
    },

    /**
     * Remove an element from its parent node.
     *
     * @param  {HTMLElement} element
     */
    removeElement: function (element) {
        if (!element || null === element.parentNode) {
            return;
        }
        element.parentNode.removeChild(element);
    },

    /**
     * Put an element aside from its parent node.
     *
     * @param  {HTMLElement} element
     */
    putAsideElement: function (element) {
        if (!element || null === element.parentNode) {
            return;
        }
        this._locations.push({
            element: element,
            parent: element.parentNode,
            position: this.getPosition(element),
            prev: element.previousSibling,
            next: element.nextSibling,
        });
        this.removeElement(element);
        element.setAttribute('outside-dom', true);
    },

    /**
     * Get position of an element in its parent node.
     *
     * @param  {HTMLElement} element
     *
     * @return {int|null}
     */
    getPosition: function (element) {
        if (!element || null === element.parentNode) {
            return null;
        }
        var position = 0;
        var child = element;
        while ((child = child.previousSibling) !== null) {
            ++position;
        }

        return position;
    },

    /**
     * Find all elements matching with a given selector in a given container.
     *
     * @param  {string}           selector
     * @param  {HTMLElement|null} target
     *
     * @return {Array}
     */
    find: function (selector, container) {
        var elements = [];
        if (selector.match(/^#+[a-z0-9_-]+$/i)) {
            elements.push(document.getElementById(selector.substr(1)));
        } else {
            container = container || document.documentElement;
            try {
                elements = [].slice.call(container.querySelectorAll(selector));
            } catch (e) {
                elements = [].slice.call(container.querySelectorAll(this._escapeSelector(selector)));
            }
        }

        return elements.filter(function (node) { return null !== node; });
    },

    /**
     * Find first element matching with a given selector in a given container.
     *
     * @param  {string}           selector
     * @param  {HTMLElement|null} container
     *
     * @return {HTMLElement|null}
     */
    first: function (selector, container) {
        var elements = this.find(selector, container);

        return elements.length > 0 ? elements[0] : null;
    },

    /**
     * Check if an element matches a given selector.
     *
     * @param  {string}       selector
     * @param  {HTMLElement}  element
     *
     * @return {Boolean}
     */
    isMatching: function (selector, element) {
        var result = false;
        var match = HTMLElement.prototype.matches || HTMLElement.prototype.matchesSelector || HTMLElement.prototype.msMatchesSelector || HTMLElement.prototype.mozMatchesSelector || HTMLElement.prototype.webkitMatchesSelector || HTMLElement.prototype.oMatchesSelector || null;
        if (match) {
            try {
                result = match.call(element, selector);
            } catch (e) {
                result = match.call(element, this._escapeSelector(selector));
            }
        }

        return result;
    },

    /**
     * Turn a form into an object.
     *
     * @param  {HTMLElement} form
     *
     * @return {object}
     *
     * @link  https://code.google.com/archive/p/form-serialize/downloads
     */
    formToObject: function (form) {
        if (!form || 'FORM' !== form.nodeName) {
            return {};
        }
        var i;
        var j;
        var data = {};
        for (i = form.elements.length - 1; i >= 0; --i) {
            if ('' === form.elements[i].name) {
                continue;
            }
            switch (form.elements[i].nodeName) {
                case 'INPUT':
                    switch (form.elements[i].type) {
                        case 'text':
                        case 'hidden':
                        case 'password':
                        case 'button':
                        case 'reset':
                        case 'submit':
                        case 'file':
                            data[form.elements[i].name] = form.elements[i].value;
                            break;
                        case 'checkbox':
                        case 'radio':
                            if (form.elements[i].checked) {
                                data[form.elements[i].name] = form.elements[i].value;
                            }
                            break;
                    }
                    break;
                case 'TEXTAREA':
                    data[form.elements[i].name] = form.elements[i].value;
                    break;
                case 'SELECT':
                    switch (form.elements[i].type) {
                        case 'select-one':
                            data[form.elements[i].name] = form.elements[i].value;
                            break;
                        case 'select-multiple':
                            for (j = form.elements[i].options.length - 1; j >= 0; --j) {
                                data[form.elements[i].name] = [];
                                if (form.elements[i].options[j].selected) {
                                    data[form.elements[i].name].push(form.elements[i].options[j].value);
                                }
                            }
                            break;
                    }
                    break;
                case 'BUTTON':
                    switch (form.elements[i].type) {
                        case 'reset':
                        case 'submit':
                        case 'button':
                            data[form.elements[i].name] = form.elements[i].value;
                            break;
                    }
                    break;
            }
        }

        return data;
    },
};

module.exports = new DOMManipulator();
