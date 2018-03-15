// Requirements
var EventService = require('../../../src/components/event/classes/EventService');

/**
 * Events is an instance of EventService, giving an api for dealing with dom events.
 *
 * @return {EventService}
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var events = new EventService();

module.exports = events;
