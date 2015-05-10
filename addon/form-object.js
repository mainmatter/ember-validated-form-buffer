import EmberValidations from 'ember-validations';
import BufferedProxy from 'ember-buffered-proxy/proxy';

export default BufferedProxy.extend(EmberValidations.Mixin, {
  apiErrors: Ember.computed.oneWay('content.errors'),

  displayErrors: Ember.computed('validators.@each.isValid', 'apiErrors.[]', function() {
    var displayErrors = Ember.A(Ember.keys(this.get('errors')).map((key) =>
      `${key}: ${this.get(`errors.${key}`).join(', ')}`
    ))
    displayErrors.pushObjects(this.get('apiErrors').mapBy('message'));
    return displayErrors;
  })
});
