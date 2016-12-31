/* jshint expr:true */
import Ember from 'ember';
import { setupTest } from 'ember-mocha';
import { it, describe } from 'mocha';
import { expect } from 'chai';
import property from 'ember-validated-form-buffer/property';

describe('property', () => {
  let TestClass;
  let testInstance;
  let model;
  let container;

  setupTest(() => {
    container = Ember.Object.create();
    model = Ember.Object.create();
    TestClass = Ember.Object.extend({
      data: property('model')
    });
    testInstance = TestClass.create({ model, container });
  });

  it('defines a computed property', () => {
    TestClass = Ember.Object.extend({
      data: property('model')
    });

    TestClass.eachComputedProperty((property) => {
      expect(property).to.eq('data');
    });
  });

  it("sets the model as the buffer's content", () => {
    expect(testInstance.get('data.content')).to.eql(model);
  });

  it("sets the container as the buffer's container", () => {
    expect(testInstance.get('data.container')).to.eql(container);
  });

  it('mixes in all specified mixins', () => {
    TestClass = Ember.Object.extend({
      data: property('model', {
        methodA() {}
      }, {
        methodB() {}
      }, {
        methodC() {}
      })
    });
    testInstance = TestClass.create({ model, container });

    expect(Ember.typeOf(testInstance.get('data').methodA)).to.eq('function');
    expect(Ember.typeOf(testInstance.get('data').methodB)).to.eq('function');
    expect(Ember.typeOf(testInstance.get('data').methodC)).to.eq('function');
  });
});
