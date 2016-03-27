import Ember from 'ember';
import getOwner from 'ember-getowner-polyfill';
import Buffer from './buffer';

const { keys } = Object;

function creatFormBuffer(model, owner, ...mixins) {
  const ownerInjection = owner.ownerInjection();
  const ownerProperties = keys(ownerInjection).reduce((acc, key) => {
    acc[key] = null;
    return acc
  }, {});

  return Buffer.extend(...mixins, ownerProperties).create(ownerInjection, {
    content: model
  });
}

export default function formBufferProperty(modelProperty, ...mixins) {
  return Ember.computed(modelProperty, function() {
    const model = this.get(modelProperty);
    const owner = getOwner(this);

    return creatFormBuffer(model, owner, ...mixins);
  });
}
