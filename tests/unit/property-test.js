/* jshint expr:true */
import Ember from 'ember';
import { setupModelTest, it } from 'ember-mocha';
import { describe, beforeEach } from 'mocha';
import { expect } from 'chai';
import property from 'ember-validated-form-buffer/property';

const { getOwner } = Ember;

describe('property', () => {
  let TestClass;
  let testInstance;
  let model;

  setupModelTest('user');

  beforeEach(function() {
    model = this.subject();
    let owner = getOwner(model);
    TestClass = Ember.Object.extend(
      owner.ownerInjection(),
      { data: property('model') }
    );
    testInstance = TestClass.create({ model });
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

  it('mixes in all specified mixins', () => {
    let owner = getOwner(model);
    TestClass = Ember.Object.extend(
      owner.ownerInjection(),
      {
        data: property('model', {
          methodA() {}
        }, {
          methodB() {}
        }, {
          methodC() {}
        })
      }
    );
    testInstance = TestClass.create({ model });

    expect(Ember.typeOf(testInstance.get('data').methodA)).to.eq('function');
    expect(Ember.typeOf(testInstance.get('data').methodB)).to.eq('function');
    expect(Ember.typeOf(testInstance.get('data').methodC)).to.eq('function');
  });
});
