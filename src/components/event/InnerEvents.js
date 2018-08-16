// Requirements
var EventService = require('@/components/event/classes/EventService');

/**
 * InnerEvents is an instance of EventService used only by app components, giving an api for dealing with dom events.
 *
 * @return {EventService}
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
var innerEvents = new EventService();

module.exports = innerEvents;
