import Ember from 'ember';
import validatedBuffer from './validated-buffer';

export default function formObject(model, impl = {}) {
  return Ember.computed(model, function() {
    return validatedBuffer(this.get(model), impl);
  });
}
