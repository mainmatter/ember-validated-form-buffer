import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import formBufferProperty from 'ember-validated-form-buffer';

const { keys } = Object;

const Validations = buildValidations({
  name: validator('presence', true)
});

export default Ember.Controller.extend({
  data: formBufferProperty('model', Validations, {
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
