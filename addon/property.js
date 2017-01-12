import Ember from 'ember';
import Buffer from './buffer';

const { keys } = Object;
const { getOwner, computed } = Ember;

function createFormBuffer(model, owner, ...mixins) {
  let ownerInjection = owner.ownerInjection();
  let ownerProperties = keys(ownerInjection).reduce((acc, key) => {
    acc[key] = null;
    return acc;
  }, {});

  return Buffer.extend(...mixins, ownerProperties).create(ownerInjection, {
    content: model
  });
}

export default function formBufferProperty(modelProperty, ...mixins) {
  return computed(modelProperty, function() {
    let model = this.get(modelProperty);
    let owner = getOwner(this);

    return createFormBuffer(model, owner, ...mixins);
  });
}
