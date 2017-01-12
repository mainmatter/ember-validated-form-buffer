import Ember from 'ember';
import DS from 'ember-data';
import BufferedProxy from 'ember-buffered-proxy/proxy';

const { keys } = Object;
const {
  computed,
  isEmpty,
  isNone,
  makeArray,
  isPresent,
  Evented,
  A,
  Object: EmberObject
} = Ember;
const { Model } = DS;

export default BufferedProxy.extend(Evented, {
  unsetApiErrors() {},

  init() {
    this._super(...arguments);

    let content = this.get('content');
    if (content instanceof Model) {
      content.on('didCommit', () => this._clearApiErrorBlacklist());
      content.on('becameInvalid', () => this._clearApiErrorBlacklist());
    }
  },

  apiErrors: computed('content.errors.[]', function() {
    let content = this.get('content');
    if (content instanceof Model) {
      return content.get('errors');
    } else {
      return [];
    }
  }),

  clientErrors: computed('validations.errors.[]', function() {
    let validationErrors = this.get('validations.errors');
    let errorAttributes = A(validationErrors).mapBy('attribute');
    let clientErrors = EmberObject.create();
    errorAttributes.forEach((key) => {
      let errors = makeArray(this.get(`validations.attrs.${key}.errors`));
      let messages = A(errors).mapBy('message');
      if (isPresent(messages)) {
        clientErrors.set(key, messages);
      }
    });
    return clientErrors;
  }),

  displayErrors: computed('clientErrors.[]', 'apiErrors.[]', '_apiErrorBlacklist.[]', function() {
    let { apiErrors, _apiErrorBlacklist: apiErrorBlacklist, clientErrors } = this.getProperties(
      'apiErrors', '_apiErrorBlacklist', 'clientErrors'
    );
    let displayErrors = EmberObject.create();
    keys(clientErrors).forEach((key) => {
      let value = clientErrors.get(key);
      displayErrors.set(key, A(value));
    });
    apiErrors.forEach((apiError) => {
      if (!apiErrorBlacklist.includes(apiError.attribute)) {
        if (isNone(displayErrors.get(apiError.attribute))) {
          displayErrors.set(apiError.attribute, A());
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
    let unsetApiErrors = makeArray(this.unsetApiErrors.apply(this));
    this.get('_apiErrorBlacklist').pushObjects(unsetApiErrors);
  },

  _apiErrorBlacklist: computed(function() {
    return A();
  }),

  _clearApiErrorBlacklist() {
    this.get('_apiErrorBlacklist').clear();
  }
});
