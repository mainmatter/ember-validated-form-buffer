import Ember from 'ember';

const { keys } = Object;
const { computed, get } = Ember;

export default Ember.Component.extend({
  positionalParams: ['object'],

  keyValuePairs: computed('object', function() {
    let object = this.get('object');

    return keys(object).map((key) => {
      return { key, value: get(object, key) };
    });
  })
});
