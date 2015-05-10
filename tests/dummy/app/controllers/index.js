import Ember from 'ember';
import formObject from 'ember-form-objects/form-object';

export default Ember.Controller.extend({
  data: formObject('model', {
    validations: {
      name: {
        presence: true
      }
    }
  }),

  displayErrors: Ember.computed('data.validators.@each.isValid', function() {
    return Ember.A(Ember.keys(this.get('data.errors')).map((key) => 
      `${key}: ${this.get(`data.errors.${key}`).join(', ')}`
    ))
  }),

  actions: {
    submitForm: function() {
      this.get('model').save();
    }
  }
});
