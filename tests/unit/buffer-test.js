/* jshint expr:true */
import Ember from 'ember';
import DS from 'ember-data';
import { it } from 'ember-mocha';
import { describe, beforeEach } from 'mocha';
import { expect } from 'chai';
import Buffer from 'ember-validated-form-buffer/buffer';

describe('Buffer', () => {
  let buffer;
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
    buffer = Buffer.create({ content });
  });

  describe('displayErrors', () => {
    it('is empty by default', () => {
      expect(buffer.get('displayErrors')).to.be.empty;
    });

    it('contains the client errors', () => {
      buffer.set('clientErrors', Ember.Object.create({
        attr: ['invalid']
      }));

      expect(buffer.get('displayErrors.attr')).to.have.members(['invalid']);
    });

    it('merges API errors with the client errors', () => {
      buffer.set('clientErrors', Ember.Object.create({
        attr: ['invalid']
      }));
      buffer.set('apiErrors', [
        { attribute: 'attr', message: 'malformed' },
        { attribute: 'attr2', message: 'missing' }
      ]);

      expect(buffer.get('displayErrors.attr')).to.have.members(['invalid', 'malformed']);
      expect(buffer.get('displayErrors.attr2')).to.have.members(['missing']);
    });

    it('does not merge blacklisted API errors', () => {
      buffer.set('clientErrors', Ember.Object.create({
        attr: ['invalid']
      }));
      buffer.set('apiErrors', [
        { attribute: 'attr', message: 'malformed' },
        { attribute: 'attr2', message: 'missing' }
      ]);
      buffer.get('_apiErrorBlacklist').pushObjects(['attr', 'attr2']);

      expect(buffer.get('displayErrors.attr')).to.have.members(['invalid']);
      expect(buffer.get('displayErrors.attr2')).to.be.undefined;
    });
  });

  describe('hasDisplayErrors', () => {
    describe('when displayErrors is empty', () => {
      it('is false', () => {
        expect(buffer.get('hasDisplayErrors')).to.be.false;
      });
    });

    describe('when displayErrors is not empty', () => {
      beforeEach(() => buffer.set('displayErrors', { property: 'error' }));

      it('is true', () => {
        expect(buffer.get('hasDisplayErrors')).to.be.true;
      });
    });
  });

  describe('apiErrors', () => {
    describe('when the content is a DS.Model', () => {
      beforeEach(() => {
        content = DS.Model.extend({
          attr: DS.attr()
        })._create();
        buffer = Buffer.create({ content });
      });

      it("returns the model's errors", () => {
        content.get('errors').set('attr', 'invalid');

        expect(buffer.get('apiErrors.attr')).to.eq('invalid');
      });
    });

    describe('when the content is not a DS.Model', () => {
      it('is empty', () => {
        expect(buffer.get('apiErrors')).to.be.empty;
      });
    });
  });

  describe('clientErrors', () => {
    it("returns the object's validation errors", () => {
      buffer.set('validations.attrs.attr', Ember.Object.create({ errors: [{ message: 'invalid' }] }));
      buffer.get('validations.errors').pushObject(Ember.Object.create({ attribute: 'attr' }));

      expect(buffer.get('clientErrors.attr')).to.have.members(['invalid']);
    });

    it('does not contain attributes with empty error lists', () => {
      buffer.set('validations.attrs.attr', Ember.Object.create({ errors: [] }));
      buffer.get('validations.errors').pushObject(Ember.Object.create({ attribute: 'attr' }));

      expect(buffer.get('clientErrors.attr')).to.be.undefined;
    });
  });

  describe('setting an unknown property', () => {
    describe("when the new property value equals the content's property value", () => {
      it('does not add the property to the apiErrorBlacklist', () => {
        content.set('attr', 'test');
        buffer.set('attr', 'test');

        expect(buffer.get('_apiErrorBlacklist')).to.be.empty;
      });
    });

    describe("when the new property value does not equal the content's property value", () => {
      it('adds the property to the apiErrorBlacklist', () => {
        buffer.set('attr', 'test');

        expect(buffer.get('_apiErrorBlacklist')).to.have.members(['attr']);
      });
    });

    describe('when the form object implements the "unsetApiErrors" method', () => {
      Ember.A(['other', ['other1', 'other2']]).forEach((returnValue) => {
        describe(`when the "unsetApiErrors" method returns ${returnValue}`, () => {
          it('adds errors returned from it to the apiErrorBlacklist', () => {
            buffer.unsetApiErrors = function() {
              return returnValue;
            };
            buffer.set('attr', 'test');
            let expected = Ember.A(['attr']).pushObjects(Ember.makeArray(returnValue));

            expect(buffer.get('_apiErrorBlacklist')).to.have.members(expected);
          });
        });
      });

      Ember.A([[], null, undefined]).forEach((returnValue) => {
        describe(`when the "unsetApiErrors" method returns ${returnValue}`, () => {
          it('does not modify the apiErrorBlacklist', () => {
            buffer.unsetApiErrors = function() {
              return returnValue;
            };
            buffer.set('attr', 'test');

            expect(buffer.get('_apiErrorBlacklist')).to.have.members(['attr']);
          });
        });
      });
    });
  });

  describe('when the content is a DS.Model', () => {
    beforeEach(() => {
      content = DS.Model.extend()._create();
      buffer = Buffer.create({ content });
    });

    describe('when the content triggers the "becameInvalid" event', () => {
      beforeEach(() => {
        buffer.get('_apiErrorBlacklist').pushObject('test');
      });

      it('clears the API errors blacklist', (done) => {
        content.trigger('becameInvalid');

        Ember.run.next(() => {
          expect(buffer.get('_apiErrorBlacklist')).to.be.empty;
          done();
        });
      });
    });

    describe('when the content triggers the "didCommit" event', () => {
      beforeEach(() => {
        buffer.get('_apiErrorBlacklist').pushObject('test');
      });

      it('clears the API errors blacklist', (done) => {
        content.trigger('didCommit');

        Ember.run.next(() => {
          expect(buffer.get('_apiErrorBlacklist')).to.be.empty;
          done();
        });
      });
    });
  });
});
