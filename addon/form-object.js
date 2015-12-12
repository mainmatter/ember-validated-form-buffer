import Ember from 'ember';
import DS from 'ember-data';
import BufferedProxy from 'ember-buffered-proxy/proxy';

const { computed, on, isEmpty, isNone, makeArray } = Ember;
const { keys } = Object;

export default BufferedProxy.extend(Ember.Evented, {
  changes: computed.alias('buffer'),
  unsetApiErrors() {},

  _setupModelEvents: on('init', function() {
    const content = this.get('content');
    if (content instanceof DS.Model) {
      content.on('didCommit', () => this.clearApiErrorBlacklist());
      content.on('becameInvalid', () => this.clearApiErrorBlacklist());
    }
  }),

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
    const unsetApiErrors = makeArray(this.unsetApiErrors.apply(this));
    this.get('apiErrorBlacklist').pushObjects(unsetApiErrors);
  }),

  displayErrors: computed('validations.errors.[]', 'apiErrors.[]', 'apiErrorBlacklist.[]', function() {
    const errorAttributes = Ember.A(this.get('validations.errors')).mapBy('attribute');
    let displayErrors = Ember.Object.create();
    errorAttributes.forEach((key) => {
      const errors = Ember.A(makeArray(this.get(`validations.attrs.${key}.errors`))).mapBy('message');
      displayErrors.set(key, errors);
    });
    this.get('apiErrors').forEach((apiError) => {
      if (!this.get('apiErrorBlacklist').contains(apiError.attribute)) {
        if (isNone(displayErrors.get(apiError.attribute))) {
          displayErrors.set(apiError.attribute, Ember.A());
        }
        displayErrors.get(apiError.attribute).push(apiError.message);
      }
    });
    return displayErrors;
  }),

  hasDisplayErrors: computed('displayErrors', function() {
    return !isEmpty(keys(this.get('displayErrors')));
  })
});
