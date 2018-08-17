/**
 * This is the main file building the nucleon app object.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
module.exports = {
    channel: require('@/components/channel/Channel'),
    Collection: require('@/components/model/classes/Collection'),
    events: require('@/components/event/Events'),
    http: require('@/components/http/Client'),
    memory: require('@/components/browser/Memory'),
    Model: require('@/components/model/classes/Model'),
    models: require('@/components/model/Models'),
    Page: require('@/components/page/classes/Page'),
    pages: require('@/components/page/Pages'),
    View: require('@/components/view/classes/View'),
    views: require('@/components/view/Views'),
    redirect: require('@/components/http/Redirect'),
    router: require('@/components/routing/Router'),
};
