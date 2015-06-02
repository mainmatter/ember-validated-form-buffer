import Ember from 'ember';
import DS from 'ember-data';
import EmberValidations from 'ember-validations';
import BufferedProxy from 'ember-buffered-proxy/proxy';

export default BufferedProxy.extend(EmberValidations.Mixin, Ember.Evented, {
  apiErrors: Ember.computed.oneWay('content.errors'),
  changes: Ember.computed.alias('buffer'),
  unsetApiErrors: Ember.K,

  init: function() {
    this._super();
    var content = this.get('content');
    if (content instanceof DS.Model) {
      content.on('becameInvalid', 'didCommit', () => {
        this.get('apiErrorBlacklist').clear();
      });
    }
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
    var unsetApiErrors = Ember.makeArray(this.unsetApiErrors.apply(this));
    this.get('apiErrorBlacklist').pushObjects(unsetApiErrors);
  }),

  displayErrors: Ember.computed('validators.@each.isValid', 'apiErrors.[]', 'apiErrorBlacklist.[]', function() {
    var errorKeys = Ember.keys(this.get('errors')).filter((key) => {
      return Ember.isPresent(this.get(`errors.${key}`));
    });
    var displayErrors = Ember.Object.create();
    errorKeys.forEach((key) => {
      var errors = Ember.makeArray(this.get(`errors.${key}`));
      displayErrors.set(key, errors);
    });
    this.get('apiErrors').forEach((apiError) => {
      if (!this.get('apiErrorBlacklist').contains(apiError.attribute)) {
        if (Ember.isNone(displayErrors.get(apiError.attribute))) {
          displayErrors.set(apiError.attribute, Ember.A());
        }
        displayErrors.get(apiError.attribute).push(apiError.message);
      }
    });
    return displayErrors;
  }),

  hasDisplayErrors: Ember.computed('displayErrors', function() {
    return !Ember.isEmpty(Ember.keys(this.get('displayErrors')));
  })
});
