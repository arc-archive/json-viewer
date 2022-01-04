import { fixture, assert, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import '../js-max-number-error.js';

/** @typedef {import('../js-max-number-error').JsMaxNumberError} JsMaxNumberError */

describe('<js-max-number-error>', function() {
  async function basicFixture() {
    return (await fixture(`<js-max-number-error></js-max-number-error>`));
  }

  /**
   * 
   * @returns {Promise<JsMaxNumberError>}
   */
  async function valueFixture() {
    return (await fixture(`<js-max-number-error expectednumber="123456789012345678890"></js-max-number-error>`));
  }

  describe('toggle()', function() {
    let element;

    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls toggle on the collapse', function() {
      const node = element.shadowRoot.querySelector('anypoint-collapse');
      const spy = sinon.spy(node, 'toggle');
      element.toggle();
      assert.isTrue(spy.called);
    });

    it('sets aria-expanded when opened', function() {
      element.toggle();
      assert.equal(element.getAttribute('aria-expanded'), 'true');
    });

    it('sets aria-expanded when closed', async () => {
      element.toggle();
      await nextFrame();
      element.toggle();
      assert.equal(element.getAttribute('aria-expanded'), 'false');
    });
  });

  describe('_keyDown', () => {
    let element;

    beforeEach(async () => {
      element = await basicFixture();
    });

    function fire(element, code) {
      const e = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        code,
      });
      element.dispatchEvent(e);
    }

    it('Calls toggle when Enter', () => {
      const spy = sinon.spy(element, 'toggle');
      fire(element, 'Enter');
      assert.isTrue(spy.called);
    });

    it('Calls toggle when NumpadEnter', () => {
      const spy = sinon.spy(element, 'toggle');
      fire(element, 'NumpadEnter');
      assert.isTrue(spy.called);
    });

    it('Calls toggle when Space', () => {
      const spy = sinon.spy(element, 'toggle');
      fire(element, 'Space');
      assert.isTrue(spy.called);
    });

    it('Ignores other', () => {
      const spy = sinon.spy(element, 'toggle');
      fire(element, 'A');
      assert.isFalse(spy.called);
    });
  });

  describe('a11y', () => {
    it('is accessible when closed', async () => {
      const element = await valueFixture();
      await assert.isAccessible(element);
    });

    it('is accessible when opened', async () => {
      const element = await valueFixture();
      element.toggle();
      await nextFrame();
      await assert.isAccessible(element);
    });
  });
});
