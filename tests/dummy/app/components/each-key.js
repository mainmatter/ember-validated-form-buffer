import Ember from 'ember';

export default Ember.Component.extend({
  items: Ember.computed('object', function() {
    var object = this.get('object');
    var keys   = Ember.keys(object);

    return Ember.A(keys.map(function(key) {
      return { key: key, value: object[key]};
    }));
  })
});
