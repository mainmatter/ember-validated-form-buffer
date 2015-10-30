import Ember from 'ember';
import DS from 'ember-data';
import EmberValidations from 'ember-validations';
import BufferedProxy from 'ember-buffered-proxy/proxy';

const { computed, on } = Ember;

export default BufferedProxy.extend(EmberValidations, Ember.Evented, {
  changes: computed.alias('buffer'),
  unsetApiErrors: Ember.K,

  init() {
    this._super();
    const content = this.get('content');
    if (content instanceof DS.Model) {
      content.on('becameInvalid', 'didCommit', () => {
        this.clearApiErrorBlacklist();
      });
    }
  },

  apiErrors: computed('content.errors', function() {
    const content = this.get('content');
    if (content instanceof DS.Model) {
      return content.get('errors');
    } else {
      return [];
    }
  }),

  apiErrorBlacklist: computed(function() {
    return Ember.A();
  }),

  clearApiErrorBlacklist() {
    this.get('apiErrorBlacklist').clear();
  },

  setUnknownProperty(key, value) {
    this._super(key, value);
    this.trigger('didSetFormProperty', key, value);
  },

  formPropertySet: on('didSetFormProperty', function(key) {
    if (this.get(key) !== this.get(`content.${key}`)) {
      this.get('apiErrorBlacklist').pushObject(key);
    }
    const unsetApiErrors = Ember.makeArray(this.unsetApiErrors.apply(this));
    this.get('apiErrorBlacklist').pushObjects(unsetApiErrors);
  }),

  displayErrors: computed('validators.@each.isValid', 'apiErrors.[]', 'apiErrorBlacklist.[]', function() {
    const errorKeys = Ember.keys(this.get('errors')).filter((key) => {
      return Ember.isPresent(this.get(`errors.${key}`));
    });
    let displayErrors = Ember.Object.create();
    errorKeys.forEach((key) => {
      const errors = Ember.makeArray(this.get(`errors.${key}`));
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

  hasDisplayErrors: computed('displayErrors', function() {
    return !Ember.isEmpty(Ember.keys(this.get('displayErrors')));
  })
});
