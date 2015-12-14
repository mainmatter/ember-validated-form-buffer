import Ember from 'ember';
import DS from 'ember-data';
import BufferedProxy from 'ember-buffered-proxy/proxy';

const { computed, on, isEmpty, isNone, makeArray, isPresent } = Ember;
const { keys } = Object;

export default BufferedProxy.extend(Ember.Evented, {
  changes: computed.alias('buffer'),
  unsetApiErrors() {},

  _setupModelEvents: on('init', function() {
    const content = this.get('content');
    if (content instanceof DS.Model) {
      content.on('didCommit', () => this._clearApiErrorBlacklist());
      content.on('becameInvalid', () => this._clearApiErrorBlacklist());
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

  clientErrors: computed('validations.errors.[]', function() {
    const validationErrors = this.get('validations.errors');
    const errorAttributes = Ember.A(validationErrors).mapBy('attribute');
    let clientErrors = Ember.Object.create();
    errorAttributes.forEach((key) => {
      const errors = makeArray(this.get(`validations.attrs.${key}.errors`));
      const messages = Ember.A(errors).mapBy('message');
      if (isPresent(messages)) {
        clientErrors.set(key, messages);
      }
    });
    return clientErrors;
  }),

  displayErrors: computed('clientErrors.[]', 'apiErrors.[]', '_apiErrorBlacklist.[]', function() {
    const { apiErrors, _apiErrorBlacklist: apiErrorBlacklist, clientErrors } = this.getProperties(
      'apiErrors', '_apiErrorBlacklist', 'clientErrors'
    );
    const displayErrors = Ember.Object.create();
    keys(clientErrors).forEach((key) => {
      const value = clientErrors.get(key);
      displayErrors.set(key, value);
    });
    apiErrors.forEach((apiError) => {
      if (!apiErrorBlacklist.contains(apiError.attribute)) {
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
  }),

  setUnknownProperty(key, value) {
    this._super(key, value);
    this.trigger('didSetFormProperty', key, value);
  },

  _apiErrorBlacklist: computed(function() {
    return Ember.A();
  }),

  _clearApiErrorBlacklist() {
    this.get('_apiErrorBlacklist').clear();
  },

  _formPropertySet: on('didSetFormProperty', function(key) {
    if (this.get(key) !== this.get(`content.${key}`)) {
      this.get('_apiErrorBlacklist').pushObject(key);
    }
    const unsetApiErrors = makeArray(this.unsetApiErrors.apply(this));
    this.get('_apiErrorBlacklist').pushObjects(unsetApiErrors);
  })
});
