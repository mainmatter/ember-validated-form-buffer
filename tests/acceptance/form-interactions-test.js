import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import testSelector from '../helpers/ember-test-selectors';
import Pretender from 'pretender';

const INPUT_FIELD = `${testSelector('input')} input`;

describe('Acceptance | form interactions', () => {
  let application;
  let server;

  beforeEach(() => {
    server = new Pretender(function() {
      this.get('/users/1', () => {
        let response = {
          data: {
            id: 1,
            type: 'users',
            attributes: {
              name: 'user name'
            }
          }
        };
        return [200, { 'Content-Type': 'application/json' }, JSON.stringify(response)];
      });

      this.patch('/users/1', () => {
        let response = {
          errors: [
            {
              source: {
                pointer: '/data/attributes/name'
              },
              title: 'too short'
            }
          ]
        };
        return [422, { 'Content-Type': 'application/json' }, JSON.stringify(response)];
      });
    });

    application = startApp();
    return visit('/');
  });

  afterEach(() => {
    server.shutdown();
    destroyApp(application);
  });

  it('can reset changes', () => {
    expect(find(INPUT_FIELD).val()).to.eq('user name');

    fillIn(INPUT_FIELD, 'new value');
    andThen(() => {
      expect(find(INPUT_FIELD).val()).to.eq('new value');
    });

    click(testSelector('reset'));
    return andThen(() => {
      expect(find(INPUT_FIELD).val()).to.eq('user name');
    });
  });

  it('shows client validation errors', () => {
    fillIn(INPUT_FIELD, '');

    return andThen(() => {
      expect(find(testSelector('error')).length).to.eq(1);
    });
  });

  it('shows server errors', () => {
    click('button[type="submit"]');

    return andThen(() => {
      expect(find(testSelector('error')).length).to.eq(1);
    });
  });

  it('shows client and server errors combined', () => {
    fillIn(INPUT_FIELD, '');
    click('button[type="submit"]');

    return andThen(() => {
      expect(find(testSelector('error')).length).to.eq(2);
    });
  });

  it('hides server errors when the field is modified', () => {
    click('button[type="submit"]');
    andThen(() => {
      expect(find(testSelector('error')).length).to.eq(1);
    });

    fillIn(INPUT_FIELD, 'new value');
    return andThen(() => {
      expect(find(testSelector('error')).length).to.eq(0);
    });
  });
});
