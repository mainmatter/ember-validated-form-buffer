import Ember from 'ember';
import formObject from 'ember-form-objects/form-object-cp';

export default Ember.Controller.extend({
  data: formObject('model', {
    validations: {
      name: {
        presence: true
      }
    }
  }),

  actions: {
    submitForm: function() {
      this.get('model').save();
    }
  }
});
