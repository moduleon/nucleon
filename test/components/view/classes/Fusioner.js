var assert = require('assert');

describe('src/components/view/classes/Fusioner', function () {

    // Create a virtual window, document for running tests
    before(function () {
        require('../../../jsdom-handler')();
    });

    var element;
    var fusioner;
    var shouldApply = true;
    var onUpdate;
    var onUpdated;
    var Fusioner = require('../../../../src/components/view/classes/Fusioner');
    var Model = require('../../../../src/components/model/classes/Model');
    var DOMManipulator = require('../../../../src/components/dom/DOMManipulator');

    describe.only('new Fusioner(config)', function () {

        it('Should return a new Fusioner instance', function (done) {
            elements = DOMManipulator.createElement(
                '<div id="test" data-if="user.show == true">'+
                    '<p>{{ user.firstname }} <a id="profile_btn" href="/{{ user.id }}">See</a></p>'+
                    '<ul id="friends_list" data-show="user.friends.length > 0">'+
                        '<li data-for="friend in user.friends">{{ friend.firstname }}</li>'+
                    '</ul>'+
                '</div>'
            );
            document.getElementsByTagName('body')[0].appendChild(elements);
            fusioner = new Fusioner({
                elements: elements,
                context: new Model({
                    user: {
                        id: 1,
                        firstname: 'Kévin',
                        show: true,
                        friends: [
                            { firstname: 'Brandon' }
                        ]
                    }
                }),
                shouldApply: function () {
                    return true === shouldApply;
                },
                onUpdate: function () {
                    if (onUpdate) {
                        onUpdate();
                    }
                },
                onUpdated: function () {
                    if (onUpdated) {
                        onUpdated();
                    }
                }
            });
            assert.equal(fusioner instanceof Fusioner, true);
            done();
        });

        it('Should contain context values', function (done) {
            assert.notEqual(DOMManipulator.first('#test'), null);
            assert.equal(DOMManipulator.first('p').innerHTML.indexOf('Kévin'), 0);
            assert.equal(DOMManipulator.first('#profile_btn').href, '/1');
            assert.equal(DOMManipulator.first('#friends_list').childNodes.length, 1);
            done();
        });
    });

    describe.only('Changing context values', function () {
        it('Should update related template', function (done) {
            onUpdated = function () {
                assert.equal(DOMManipulator.first('p', element).innerHTML.indexOf('Hugo'), 0);
                onUpdated = function () {
                    assert.equal(DOMManipulator.first('#profile_btn', element).href, '/2');
                    onUpdated = function () {
                        assert.equal(DOMManipulator.first('#friends_list').style.display, 'none');
                        assert.equal(DOMManipulator.first('#friends_list').childNodes.length, 0);
                        onUpdated = function () {
                            assert.equal(DOMManipulator.first('#test'), null);
                            done();
                        };
                        fusioner._context.user.show = false;
                    };
                    fusioner._context.user.friends = [];
                };
                fusioner._context.user.id = 2;
            };
            fusioner._context.user.firstname = 'Hugo';
        });
    });

    describe.only('Changing context values when fusioner must not apply changes', function () {
        it('Should not update related template', function (done) {
            shouldApply = false;
            onUpdated = function () {
                throw new Error('onUpdated should not be called');
            };
            fusioner._context.user.firstname = 'Mike';
            fusioner._context.user.id = 3;
            fusioner._context.user.show = true;
            fusioner._context.user.friends = [
                { firstname: 'Coralie' }
            ];
            done();
        });
    });

    describe.only('.applyChanges()', function () {
        it('Should update related template', function (done) {
            onUpdated = function () {
                assert.notEqual(DOMManipulator.first('#test'), null);
                assert.equal(DOMManipulator.first('p', element).innerHTML.indexOf('Mike'), 0);
                assert.equal(DOMManipulator.first('#profile_btn', element).href, '/3');
                assert.equal(DOMManipulator.first('#friends_list').style.display, '');
                assert.equal(DOMManipulator.first('#friends_list').childNodes.length, 1);
                done();
            };
            shouldApply = true;
            fusioner.applyChanges();
        });
    });
});
