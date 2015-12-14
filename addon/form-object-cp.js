import Ember from 'ember';
import FormObject from './form-object';

export default function formObject(modelProperty, Validations = {}, impl = {}) {
  return Ember.computed(modelProperty, function() {
    const container = this.get('container');
    const model = this.get(modelProperty);
    return FormObject.extend(Validations, impl, {
      container: null
    }).create({
      container,
      content: model
    });
  });
}
