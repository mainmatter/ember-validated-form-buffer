import Ember from 'ember';
import FormObject from './form-object';

export default function formObject(model, impl = {}) {
  return Ember.computed(model, function() {
    return FormObject.extend(impl).create({
      content: this.get(model)
    });
  });
}
