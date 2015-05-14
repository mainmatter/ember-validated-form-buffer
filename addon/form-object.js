import Ember from 'ember';
import EmberValidations from 'ember-validations';
import BufferedProxy from 'ember-buffered-proxy/proxy';

export default BufferedProxy.extend(EmberValidations.Mixin, Ember.Evented, {
  apiErrors: Ember.computed.oneWay('content.errors'),

  init: function() {
    this._super();
    this.get('content').on('becameInvalid', 'didCommit', () => {
      this.get('apiErrorBlacklist').clear();
    });
  },

  apiErrorBlacklist: Ember.computed(function() {
    return Ember.A();
  }),

  setUnknownProperty: function(key, value) {
    this._super(key, value);
    this.trigger('didSetFormProperty', key, value);
  },

  formPropertySet: Ember.on('didSetFormProperty', function(key) {
    if (this.get(key) !== this.get(`content.${key}`)) {
      this.get('apiErrorBlacklist').pushObject(key);
    }
  }),

  displayErrors: Ember.computed('validators.@each.isValid', 'apiErrors.[]', 'apiErrorBlacklist.[]', function() {
    var displayErrors = Ember.A(Ember.keys(this.get('errors')).map((key) =>
      `${key}: ${this.get(`errors.${key}`).join(', ')}`
    ));
    this.get('apiErrors').forEach((apiError) => {
      if (!this.get('apiErrorBlacklist').contains(apiError.attribute)) {
        displayErrors.push(apiError.message);
      }
    });
    return displayErrors;
  })
});
