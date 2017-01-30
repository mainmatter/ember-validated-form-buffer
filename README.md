[![Build Status](https://travis-ci.org/simplabs/ember-validated-form-buffer.svg?branch=master)](https://travis-ci.org/simplabs/ember-validated-form-buffer)

# ember-validated-form-buffer

`ember-validated-form-buffer` implements a __validating buffer that wraps Ember
Data models and can be used in forms to buffer user inputs before applying them
to the underlying model__. The buffer also handles mixing client side
validation errors and errors returned from the API as well as functionality
that detects which API errors may have become obsolete due to modifications to
the respective properties.

`ember-validated-form-buffer` helps implementing common forms functionality:

* preventing modification of models until the form is submitted
* implementing cancel/reset functionality
* filtering irrelevant errors

It leverages
[ember-buffered-proxy](https://github.com/yapplabs/ember-buffered-proxy) for
the buffering functionality and 
[ember-cp-validations](https://github.com/offirgolan/ember-cp-validations) for
client side validations.

## Installation

Install `ember-validated-form-buffer` with

`ember install ember-validated-form-buffer`

## Example

In order to define a validated form buffer on a controller or component, import
the `formBufferProperty` helper and define a property that wraps the model
instance. Pass in the validations mixin as returend by ember-cp-validations.
When the form is submitted, apply the buffered changes and save the model or
discard them to reset all user input:

```js
import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import formBufferProperty from 'ember-validated-form-buffer';

const Validations = buildValidations({
  name: validator('presence', true)
});

export default Ember.Controller.extend({
  data: formBufferProperty('model', Validations),

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

Then instead of binding form inputs to model properties directly, bind them to
the buffer instead:

```hbs
<form onsubmit={{action 'submit'}}>
  <label>Name</label>
  {{input value=data.name}}
  <button type="submit">Save</button>
  <button type="button" onclick={{action 'reset'}}>Reset</button>
</form>
```

If you're not using 2 way data bindings for the input but Data Down/Actions Up,
make sure to update the buffer property instead of the model's when the
respective action is called:

```hbs
<form onsubmit={{action 'submit'}}>
  <label>Name</label>
  <input value="{{data.name}}" onkeydown={{action (mut data.name) value='currentTarget.value'}}/>
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

The buffer can be imported and used directly:

```js
import { Buffer } from 'ember-validated-form-buffer';

const Validations = buildValidations({
  name: validator('presence', true)
});

export default Ember.Controller.extend({
  data: computed('model', function() {
    let owner = Ember.getOwner(this);
    return Buffer.extend(Validations).create(owner.ownerInjection(), {
      content: this.get('model')
    });
  }),

…
```

It is generally easier to use the `formBufferProperty` macro to define a form
buffer property though:

### The `formBufferProperty` helper

The `formBufferProperty` macro takes the name of another property that returns
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
import formBufferProperty from 'ember-validated-form-buffer';

const Validations = buildValidations({
  name: validator('presence', true)
});

export default Ember.Controller.extend({
  data: formBufferProperty('model', Validations, {
    unsetApiErrors() {
      let changedKeys = Ember.A(Object.keys(this.get('buffer')));
      if (changedKeys.includes('date') || changedKeys.includes('time')) {
        return 'datetime'; // whenever the "date" or "time" attributes change, also hide errors on the virtual "datetime" property
      }
    }
  })

…
```

## License

`ember-validated-form-buffer` is developed by and &copy;
[simplabs GmbH](http://simplabs.com) and contributors. It is released under the
[MIT License](https://github.com/simplabs/ember-simple-auth/blob/master/LICENSE).

`ember-validated-form-buffer` is not an official part of
[Ember.js](http://emberjs.com) and is not maintained by the Ember.js Core Team.
