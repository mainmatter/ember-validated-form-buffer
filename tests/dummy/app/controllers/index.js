import Ember from 'ember';
import formObject from 'ember-form-object/form-object-cp';

const { keys } = Object;

export default Ember.Controller.extend({
  data: formObject('model', {
    validations: {
      name: {
        presence: true
      }
    },
    unsetApiErrors() {
      if (Ember.A(keys(this.get('changes'))).contains('name')) {
        return 'time';
      }
    }
  }),

  actions: {
    submitForm() {
      this.get('model').save();
    }
  }
});
