import Ember from 'ember';
import DS from 'ember-data';
import BufferedProxy from 'ember-buffered-proxy/proxy';

const { computed, isEmpty, isNone, makeArray, isPresent } = Ember;
const { keys } = Object;

export default BufferedProxy.extend(Ember.Evented, {
  unsetApiErrors() {},

  init() {
    this._super(...arguments);

    const content = this.get('content');
    if (content instanceof DS.Model) {
      content.on('didCommit', () => this._clearApiErrorBlacklist());
      content.on('becameInvalid', () => this._clearApiErrorBlacklist());
    }
  },

  apiErrors: computed('content.errors.[]', function() {
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
      displayErrors.set(key, Ember.A(value));
    });
    apiErrors.forEach((apiError) => {
      if (!apiErrorBlacklist.includes(apiError.attribute)) {
        if (isNone(displayErrors.get(apiError.attribute))) {
          displayErrors.set(apiError.attribute, Ember.A());
        }
        displayErrors.get(apiError.attribute).pushObject(apiError.message);
      }
    });
    return displayErrors;
  }),

  hasDisplayErrors: computed('displayErrors', function() {
    return !isEmpty(keys(this.get('displayErrors')));
  }),

  setUnknownProperty(key) {
    this._super(...arguments);

    if (this.get(key) !== this.get(`content.${key}`)) {
      this.get('_apiErrorBlacklist').pushObject(key);
    }
    const unsetApiErrors = makeArray(this.unsetApiErrors.apply(this));
    this.get('_apiErrorBlacklist').pushObjects(unsetApiErrors);
  },

  _apiErrorBlacklist: computed(function() {
    return Ember.A();
  }),

  _clearApiErrorBlacklist() {
    this.get('_apiErrorBlacklist').clear();
  }
});
