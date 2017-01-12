import Ember from 'ember';

const { keys } = Object;
const { computed, get } = Ember;

const EachInComponent = Ember.Component.extend({
  keyValuePairs: computed('object', function() {
    let object = this.get('object');

    return keys(object).map((key) => {
      return { key, value: get(object, key) };
    });
  })
});

EachInComponent.reopenClass({
  positionalParams: ['object']
});

export default EachInComponent;
