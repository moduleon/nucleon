/**
 * This is the main file building the nucleon app object.
 *
 * @author  Kevin Marcachi <kevin.marcachi@gmail.com>
 * @package nucleon-js
 */
module.exports = {
    channel: require('@/components/channel/Channel'),
    events: require('@/components/event/Events'),
    http: require('@/components/http/Client'),
    memory: require('@/components/browser/Memory'),
    models: require('@/components/model/Models'),
    pages: require('@/components/page/Pages'),
    views: require('@/components/view/Views'),
    redirect: require('@/components/http/Redirect'),
    router: require('@/components/routing/Router'),
};
