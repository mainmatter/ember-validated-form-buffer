import Ember from 'ember';
import formObject from 'ember-form-object/form-object-cp';

export default Ember.Controller.extend({
  data: formObject('model', {
    validations: {
      name: {
        presence: true
      }
    },
    unsetApiErrors() {
      if (Ember.A(Ember.keys(this.get('changes'))).contains('name')) {
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
