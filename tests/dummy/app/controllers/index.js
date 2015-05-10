import Ember from 'ember';
import formObject from 'ember-form-objects/form-object';

export default Ember.Controller.extend({
  data: formObject('model', {
    validations: {
      name: {
        presence: true
      }
    }
  })
});
