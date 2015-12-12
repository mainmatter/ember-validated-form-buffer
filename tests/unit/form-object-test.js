/* jshint expr:true */
import Ember from 'ember';
import DS from 'ember-data';
import { it } from 'ember-mocha';
import { describe, beforeEach } from 'mocha';
import { expect } from 'chai';
import FormObject from 'ember-form-object/form-object';

describe('FormObject', () => {
  let formObject;
  let content;

  beforeEach(() => {
    content = Ember.Object.extend(Ember.Evented, {
      init() {
        this._super();
        this.set('validations', Ember.Object.create({
          errors: Ember.A(),
          attrs:  Ember.Object.create()
        }));
      }
    }).create();
    formObject = FormObject.create({ content });
  });

  describe('apiErrorBlacklist', () => {
    it('is empty by default', () => {
      expect(formObject.get('apiErrorBlacklist')).to.be.empty;
    });
  });

  describe('displayErrors', () => {
    it('is empty by default', () => {
      expect(formObject.get('displayErrors')).to.be.empty;
    });

    it("contains the object's own errors", () => {
      formObject.set('validations.attrs.attr', Ember.Object.create({ errors: [{ message: 'invalid' }] }));
      formObject.get('validations.errors').pushObject(Ember.Object.create({ attribute: 'attr' }));

      expect(formObject.get('displayErrors.attr')).to.have.members(['invalid']);
    });

    it('does not contain attributes with empty error lists', () => {
      formObject.set('validations.attrs.attr', Ember.Object.create({ errors: [] }));
      formObject.get('validations.errors').pushObject(Ember.Object.create({ attribute: 'attr' }));

      expect(formObject.get('displayErrors.attr2')).to.be.undefined;
    });

    it('merges API errors with the errors', () => {
      formObject.set('validations.attrs.attr', Ember.Object.create({ errors: [{ message: 'invalid' }] }));
      formObject.get('validations.errors').pushObject(Ember.Object.create({ attribute: 'attr' }));
      formObject.set('apiErrors', [
        { attribute: 'attr', message: 'malformed' },
        { attribute: 'attr2', message: 'missing' }
      ]);

      expect(formObject.get('displayErrors.attr')).to.have.members(['invalid', 'malformed']);
      expect(formObject.get('displayErrors.attr2')).to.have.members(['missing']);
    });

    it('does not merge blacklisted API errors', () => {
      formObject.set('validations.attrs.attr', Ember.Object.create({ errors: [{ message: 'invalid' }] }));
      formObject.get('validations.errors').pushObject(Ember.Object.create({ attribute: 'attr' }));
      formObject.set('apiErrors', [
        { attribute: 'attr', message: 'malformed' },
        { attribute: 'attr2', message: 'missing' }
      ]);
      formObject.get('apiErrorBlacklist').pushObjects(['attr', 'attr2']);

      expect(formObject.get('displayErrors.attr')).to.have.members(['invalid']);
      expect(formObject.get('displayErrors.attr2')).to.be.undefined;
    });
  });

  describe('hasDisplayErrors', () => {
    describe('when displayErrors is empty', () => {
      it('is false', () => {
        expect(formObject.get('hasDisplayErrors')).to.be.false;
      });
    });

    describe('when displayErrors is not empty', () => {
      beforeEach(() => formObject.set('displayErrors', { property: 'error' }));

      it('is true', () => {
        expect(formObject.get('hasDisplayErrors')).to.be.true;
      });
    });
  });

  describe('apiError', () => {
    describe('when the content is a DS.Model', () => {
      beforeEach(() => {
        content = DS.Model.extend({
          attr: DS.attr()
        })._create();
        formObject = FormObject.create({ content });
      });

      it("returns the model's errors", () => {
        content.get('errors').set('attr', 'invalid');

        expect(formObject.get('apiErrors.attr')).to.eq('invalid');
      });
    });

    describe('when the content is not a DS.Model', () => {
      it('is empty', () => {
        expect(formObject.get('apiErrors')).to.be.empty;
      });
    });
  });

  describe('clearApiErrorBlacklist', () => {
    it('clears the apiErrorBlacklist', () => {
      formObject.get('apiErrorBlacklist').push('attr');
      formObject.clearApiErrorBlacklist();

      expect(formObject.get('apiErrorBlacklist')).to.be.empty;
    });
  });

  describe('setting an unknown property', () => {
    describe("when the new property value equals the content's property value", () => {
      it('does not add the property to the apiErrorBlacklist', () => {
        content.set('attr', 'test');
        formObject.set('attr', 'test');

        expect(formObject.get('apiErrorBlacklist')).to.be.empty;
      });
    });

    describe("when the new property value does not equal the content's property value", () => {
      it('adds the property to the apiErrorBlacklist', () => {
        formObject.set('attr', 'test');

        expect(formObject.get('apiErrorBlacklist')).to.have.members(['attr']);
      });
    });

    describe('when the form object implements the "unsetApiErrors" method', () => {
      Ember.A(['other', ['other1', 'other2']]).forEach((returnValue) => {
        describe(`when the "unsetApiErrors" method returns ${returnValue}`, () => {
          it('adds errors returned from it to the apiErrorBlacklist', () => {
            formObject.unsetApiErrors = function() {
              return returnValue;
            };
            formObject.set('attr', 'test');
            const expected = Ember.A(['attr']).pushObjects(Ember.makeArray(returnValue));

            expect(formObject.get('apiErrorBlacklist')).to.have.members(expected);
          });
        });
      });

      Ember.A([[], null, undefined]).forEach((returnValue) => {
        describe(`when the "unsetApiErrors" method returns ${returnValue}`, () => {
          it('does not modify the apiErrorBlacklist', () => {
            formObject.unsetApiErrors = function() {
              return returnValue;
            };
            formObject.set('attr', 'test');

            expect(formObject.get('apiErrorBlacklist')).to.have.members(['attr']);
          });
        });
      });
    });
  });

  describe('when the content is a DS.Model', () => {
    beforeEach(() => {
      content = DS.Model.extend()._create();
      formObject = FormObject.create({ content });
    });

    describe('when the content triggers the "becameInvalid" event', () => {
      beforeEach(() => {
        formObject.get('apiErrorBlacklist').pushObject('test');
      });

      it('clears the API errors blacklist', (done) => {
        content.trigger('becameInvalid');

        Ember.run.next(() => {
          expect(formObject.get('apiErrorBlacklist')).to.be.empty;
          done();
        });
      });
    });

    describe('when the content triggers the "didCommit" event', () => {
      beforeEach(() => {
        formObject.get('apiErrorBlacklist').pushObject('test');
      });

      it('clears the API errors blacklist', (done) => {
        content.trigger('didCommit');

        Ember.run.next(() => {
          expect(formObject.get('apiErrorBlacklist')).to.be.empty;
          done();
        });
      });
    });
  });
});
