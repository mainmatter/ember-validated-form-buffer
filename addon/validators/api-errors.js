import Ember from 'ember';
import Base from 'ember-validations/validators/base';

export default Base.extend({
  call: function() {
    var modelValue  = this.model.get(`content.${this.property}`);
    var modelErrors = this.model.get(`content.errors.${this.property}`);
    if (modelValue === this.model.get(this.property) && !Ember.isEmpty(modelErrors)) {
      modelErrors.map(function(error) {
        this.errors.pushObject(error.message);
      }.bind(this));
    }
  }
});
