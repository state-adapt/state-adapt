import { goTo } from '../shell/shell.po';
import {
  getCount,
  getStatus,
  getTeardowns,
  getTicker,
  readCount,
  setKeepAlive,
} from './live.po';

/**
 * The ticker store subscribes to an RxJS interval only while something is
 * subscribed to the store. Routing is what mounts and unmounts those
 * subscribers, so this lifecycle can only be verified with the real router
 * driving real mounts — which is what makes it worth an end-to-end test.
 */
describe('shared store lifecycle across routes', () => {
  beforeEach(() => cy.visit('/'));

  it('leaves the store inactive on routes that do not use it', () => {
    getStatus().should('have.text', 'unsubscribed');
    getTicker().should('not.exist');
  });

  it('activates the store when a route that uses it mounts, and ticks', () => {
    goTo('live');

    getStatus().should('have.text', 'subscribed');
    getTicker().should('be.visible');
    getCount().should('have.text', '3');
  });

  it('tears the store down when the last route using it unmounts', () => {
    goTo('live');
    getStatus().should('have.text', 'subscribed');

    getTeardowns()
      .invoke('text')
      .then(before => {
        goTo('todos');

        getStatus().should('have.text', 'unsubscribed');
        getTicker().should('not.exist');
        getTeardowns().should('not.have.text', before);
      });
  });

  it('stays subscribed moving between two routes that share the store', () => {
    goTo('live');
    getTicker().should('be.visible');

    goTo('counter');

    getStatus().should('have.text', 'subscribed');
    getTicker().should('be.visible');
  });

  it('starts a fresh store after it has been torn down', () => {
    goTo('live');
    getCount().should('have.text', '4');

    goTo('todos');
    goTo('live');

    // Deactivating reset the store, so the count restarts rather than resuming.
    readCount(count => expect(count).to.be.lessThan(4));
  });

  it('holds the store open across every route while the shell subscribes', () => {
    goTo('todos');
    getStatus().should('have.text', 'unsubscribed');

    setKeepAlive(true);
    getStatus().should('have.text', 'subscribed');

    getTeardowns()
      .invoke('text')
      .then(before => {
        goTo('cart');
        getStatus().should('have.text', 'subscribed');

        goTo('live');
        getStatus().should('have.text', 'subscribed');

        goTo('home');
        getStatus().should('have.text', 'subscribed');

        // Never dropped to zero subscribers, so it was never torn down.
        getTeardowns().should('have.text', before);
      });
  });

  it('keeps counting across routes while held open', () => {
    setKeepAlive(true);
    goTo('live');
    getCount().should('have.text', '3');

    goTo('todos');
    goTo('live');

    // Same store instance throughout, so the count carried on.
    readCount(count => expect(count).to.be.gte(3));
  });

  it('tears the store down when the shell releases it', () => {
    setKeepAlive(true);
    goTo('todos');
    getStatus().should('have.text', 'subscribed');

    setKeepAlive(false);

    getStatus().should('have.text', 'unsubscribed');
  });
});
