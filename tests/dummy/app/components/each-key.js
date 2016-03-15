import Ember from 'ember';

const { computed } = Ember;

export default Ember.Component.extend({
  items: computed('object', function() {
    let object = this.get('object');
    let keys   = Object.keys(object);

    return Ember.A(keys.map(function(key) {
      let value = object[key];
      return { key, value };
    }));
  })
});
