import EmberValidations from 'ember-validations';
import BufferedProxy from 'ember-buffered-proxy/proxy';

export default function validatedBuffer(object, classBody, container) {
  if (container) {
    object.set('container', container);
  }

  var Buffer = BufferedProxy.extend(EmberValidations.Mixin, classBody);

  return Buffer.create({
    content: object
  });
}
