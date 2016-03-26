import Ember from 'ember';
import getOwner from 'ember-getowner-polyfill';
import FormObject from './form-object';

const { keys } = Object;

function creatFormObject(model, owner, ...mixins) {
  const ownerInjection = owner.ownerInjection();
  const ownerProperties = keys(ownerInjection).reduce((acc, key) => {
    acc[key] = null;
    return acc
  }, {});

  return FormObject.extend(...mixins, ownerProperties).create(ownerInjection, {
    content: model
  });
}

export default function formObject(modelProperty, ...mixins) {
  return Ember.computed(modelProperty, function() {
    const model = this.get(modelProperty);
    const owner = getOwner(this);

    return creatFormObject(model, owner, ...mixins);
  });
}
