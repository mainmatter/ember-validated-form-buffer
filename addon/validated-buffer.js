import EmberValidations from 'ember-validations';
import BufferedProxy from 'ember-buffered-proxy/proxy';

export default function validatedBuffer(object, classBody) {
  var Buffer = BufferedProxy.extend(EmberValidations.Mixin, classBody);

  return Buffer.create({
    content: object
  });
}
