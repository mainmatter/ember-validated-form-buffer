import Ember from 'ember';
import FormObject from './form-object';

export default function formObject(modelProperty, ...mixins) {
  return Ember.computed(modelProperty, function() {
    const container = this.get('container');
    const model = this.get(modelProperty);
    return FormObject.extend(...mixins, {
      container: null
    }).create({
      container,
      content: model
    });
  });
}
