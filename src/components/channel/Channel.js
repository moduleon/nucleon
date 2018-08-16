// Requirements
var EventSystem = require('@/classes/EventSystem');
var es = new EventSystem();

/**
 * Channel is an event publish/subscribe service used by app components and outer scripts.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var channel = {

    /**
     * Subscribe to a new app event.
     *
     * @param  {string}   event
     * @param  {Function} callback
     */
    on: function (event, callback) {
        es.on(event, 'app', callback);
    },

    /**
     * Unsubscribe to an app event.
     *
     * @param  {string}   event
     * @param  {Function} callback
     */
    off: function (event, callback) {
        es.off(event, 'app', callback);
    },

    /**
     * Trigger an app event.
     *
     * @param  {string} event
     */
    trigger: function (event) {
        var args = Array.prototype.slice.call(arguments, 1);
        args.unshift(event, 'app');
        if (false === es.trigger.apply(es, args)) {
            return false;
        }

        return true;
    }
};

module.exports = channel;
