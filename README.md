[![Build Status](https://travis-ci.org/simplabs/ember-validated-form-buffer.svg?branch=master)](https://travis-ci.org/simplabs/ember-validated-form-buffer)

# ember-validated-form-buffer

ember-validated-form-buffer implements a form buffer object that wraps Ember
Data models. __The buffer can be used in forms to buffer user inputs before
applying them to the underlying model, enabling better user interfaces__. The
buffer also handles mixing client side validation errors and errors returned
from the API as well as functionality that decides which API errors became
obsolete due to changes to the respective properties and should not be
displayed anymore.

It leverages
[ember-buffered-proxy](https://github.com/yapplabs/ember-buffered-proxy) for
the buffering functionality and 
[ember-cp-validations](https://github.com/offirgolan/ember-cp-validations) for
client side validations.

## Example

In order to define a form buffer on a controller or component, import the
`formBufferProperty` helper and define a property that wraps the model
instance. When the form is submitted, apply the buffered changes or discard
them to reset the buffer to the model's state:

```js
import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import formBufferProperty from 'ember-validated-form-buffer';

const Validations = buildValidations({
  name: validator('presence', true)
});

export default Ember.Controller.extend({
  data: formBufferProperty('model', Validations}),

  actions: {
    submit(e) {
      e.preventDefault();

      this.get('data').applyBufferedChanges();
      this.get('model').save();
    },

    reset() {
      this.get('data').discardBufferedChanges();
    }
  }
});
```

Then instead of binding form inputs to the model, bind them to the buffer
instead:

```hbs
<form onsubmit={{action 'submit'}}>
  <label>Name</label>
  {{input value=data.name}}
  <button type="submit">Save</button>
  <button type="button" onclick={{action 'reset'}}>Reset</button>
</form>
```

## API

### The buffer

The buffer has methods for applying and discarding changes as well as
properties for accessing its current error state.

* `applyBufferedChanges` applies the changes in the buffer to the underlying
  model.
* `discardBufferedChanges` discards the buffered changes to that the buffer's
  state is reset to that of the underlying model.

* `apiErrors` returns the errors as returned by the API when the model was last
  submitted.
* `clientErrors` returns the client side validation errors as returned by
  ember-cp-validations.
* `displayErrors` returns both the API errors as well as the client side
  validation errors. __This does not include any API errors on properties that
  have been changed after the model was submitted__ as changing a property that
  was previously rejected by the API potentially renders the respective error
  invalid.
* `hasDisplayErrors` returns whether the buffer currently has any errors to
  display which is the case when `displayErrors` is not empty.

For further info on the buffer's API, check the docs of [ember-buffered-proxy](https://github.com/yapplabs/ember-buffered-proxy)
and
[ember-cp-validations](https://github.com/offirgolan/ember-cp-validations)
respectively.

### The `formBufferProperty` helper

The `formBufferProperty` helper takes the name of another property that returns
the Ember Data model to wrap in the buffer as well as a list of mixins that
will be applied to the buffer. These mixins usually include the validation
mixin as created by ember-cp-validations's `buildValidations` method.

If any of the provided mixins define an `unsetApiErrors` method, that method
will be called whenever any property is changed on the buffer. The method
returns a property name or an array of property names for which all API errors
will be excluded from the `displayErrors` until the model is submitted to the
API again. That way it's possible to hide API errors on a property when a
related property changes:

```js
const Validations = buildValidations({
  name: validator('presence', true)
});

data: formBufferProperty('model', Validations, {
  unsetApiErrors() {
    let changedKeys = Ember.A(Object.keys(this.get('buffer')));
    if (changedKeys.contains('date') || changedKeys.contains('time')) {
      return 'datetime'; // whenever the date or time attributes change, also hide errors on the virtual datetime property
    }
  }
})
```

## License

ember-validated-form-buffer is developed by and &copy;
[simplabs GmbH](http://simplabs.com) and contributors. It is released under the
[MIT License](https://github.com/simplabs/ember-simple-auth/blob/master/LICENSE).

ember-validated-form-buffer is not an official part of
[Ember.js](http://emberjs.com) and is not maintained by the Ember.js Core Team.