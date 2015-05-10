import EmberValidations from 'ember-validations';
import BufferedProxy from 'ember-buffered-proxy/proxy';

export default BufferedProxy.extend(EmberValidations.Mixin, {
  apiErrors: Ember.computed.oneWay('content.errors')
});
