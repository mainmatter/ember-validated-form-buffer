import Ember from 'ember';

const { computed } = Ember;

export default Ember.Component.extend({
  items: computed('object', function() {
    const object = this.get('object');
    const keys   = Object.keys(object);

    return Ember.A(keys.map(function(key) {
      const value = object[key];
      return { key, value };
    }));
  })
});
