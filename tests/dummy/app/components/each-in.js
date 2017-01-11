import Ember from 'ember';

const { keys } = Object;
const { Component, computed, get } = Ember;

const EachInComponent = Component.extend({
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
