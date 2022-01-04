import { fixture, assert, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import '../json-viewer.js';

describe('<json-viewer>', function() {
  async function basicFixture() {
    return (await fixture(`<json-viewer json='{"test": "test", "numeric": 1234567, "boolean": true, "nullable": null, "array": ["test", 123456], "object": {"sub-property": "value"}, "long": 12345678901112131415, "link": "http://domain.com", "relativeLink": "/path/to/resource.html"}'></json-viewer>`));
  }

  async function emptyFixture() {
    return (await fixture(`<json-viewer></json-viewer>`));
  }

  async function contentActionFixture() {
    return (await fixture(`<json-viewer>
      <paper-icon-button slot="content-action"></paper-icon-button>
    </json-viewer>`));
  }


  describe('basic', function() {
    let element;
    let output;

    beforeEach(async () => {
      element = await basicFixture();
      output = element.shadowRoot.querySelector('output');
    });

    it('Should have parsed HTML', function() {
      const html = output.innerHTML;
      assert.isString(html);
    });

    it('Should have two links', function() {
      const links = output.querySelectorAll('a[response-anchor]');
      assert.equal(links.length, 2);
    });

    it('Should have one js-max-number-error', function() {
      const infos = output.querySelectorAll('js-max-number-error');
      assert.equal(infos.length, 1);
    });

    it('shows output when value', async () => {
      const node = element.shadowRoot.querySelector('output');
      assert.isFalse(node.hasAttribute('hidden'));
    });

    it('sanitizes input', () => {
      element.json = '{"str": "& <test> \\" \'"}';
      const node = element.shadowRoot.querySelector('output .stringValue');
      const result = node.innerHTML.trim();
      assert.equal(result, '&amp; &lt;test&gt; " \'');
    });
  });

  describe('Empty state', () => {
    let element;
    beforeEach(async () => {
      element = await emptyFixture();
    });

    it('Sets error state', () => {
      element.json = '{"a": "b"';
      assert.isTrue(element.isError);
    });

    it('shows output when error', async () => {
      element.json = '{"a": "b"';
      await nextFrame();
      const node = element.shadowRoot.querySelector('output');
      assert.isFalse(node.hasAttribute('hidden'));
    });
  });

  describe('content actions', function() {
    let element;
    beforeEach(async () => {
      element = await contentActionFixture();
    });

    it('Should have distributed nodes', function() {
      const slot = element.shadowRoot.querySelector('slot');
      const nodes = slot.assignedNodes();
      assert.equal(nodes.length, 1);
    });
  });

  describe('_changed()', () => {
    let element;
    beforeEach(async () => {
      element = await emptyFixture();
    });

    it('Does nothing when value undefined', () => {
      element._changed();
      assert.isFalse(element.working);
    });

    it('Calls _printPrimitiveValue() when null', () => {
      const spy = sinon.spy(element, '_printPrimitiveValue');
      element._changed(null);
      assert.equal(spy.args[0][0], 'null');
      assert.equal(spy.args[0][1], 'nullValue');
    });

    it('Calls _printPrimitiveValue() when false', () => {
      const spy = sinon.spy(element, '_printPrimitiveValue');
      element._changed(false);
      assert.equal(spy.args[0][0], 'false');
      assert.equal(spy.args[0][1], 'booleanValue');
    });

    it('Calls _printPrimitiveValue() when true', () => {
      const spy = sinon.spy(element, '_printPrimitiveValue');
      element._changed(true);
      assert.equal(spy.args[0][0], 'true');
      assert.equal(spy.args[0][1], 'booleanValue');
    });
  });

  describe('_dispatchChangeUrl()', () => {
    const url = 'test-url';
    let element;
    beforeEach(async () => {
      element = await emptyFixture();
    });

    it('Dispatches url-change-action event', () => {
      const spy = sinon.spy();
      element.addEventListener('url-change-action', spy);
      element._dispatchChangeUrl(url);
      assert.isTrue(spy.called);
    });

    it('URL is set', () => {
      const spy = sinon.spy();
      element.addEventListener('url-change-action', spy);
      element._dispatchChangeUrl(url);
      assert.equal(spy.args[0][0].detail.url, url);
    });

    it('Event bubbles', () => {
      const spy = sinon.spy();
      element.addEventListener('url-change-action', spy);
      element._dispatchChangeUrl(url);
      assert.isTrue(spy.args[0][0].bubbles);
    });
  });

  describe('_dispatchNewRequest()', () => {
    const url = 'test-url';
    let element;
    beforeEach(async () => {
      element = await emptyFixture();
    });

    it('Dispatches request-workspace-append event', () => {
      const spy = sinon.spy();
      element.addEventListener('request-workspace-append', spy);
      element._dispatchNewRequest(url);
      assert.isTrue(spy.called);
    });

    it('Request is set', () => {
      const spy = sinon.spy();
      element.addEventListener('request-workspace-append', spy);
      element._dispatchNewRequest(url);
      assert.deepEqual(spy.args[0][0].detail.request, {url});
    });

    it('Kind is set', () => {
      const spy = sinon.spy();
      element.addEventListener('request-workspace-append', spy);
      element._dispatchNewRequest(url);
      assert.equal(spy.args[0][0].detail.kind, 'ARC#Request');
    });

    it('Event bubbles', () => {
      const spy = sinon.spy();
      element.addEventListener('request-workspace-append', spy);
      element._dispatchNewRequest(url);
      assert.isTrue(spy.args[0][0].bubbles);
    });
  });

  describe('_handleDisplayClick()', () => {
    let element;

    beforeEach(async () => {
      element = await emptyFixture();
    });

    it('Does nothing when no target', () => {
      element._handleDisplayClick({});
      // no error, coverage
    });

    it('Does nothing when target has no data-toggle', () => {
      element._handleDisplayClick({
        target: document.createElement('span')
      });
      // no error, coverage
    });

    it('Does nothing when data-toggle reference does not exists', () => {
      const node = document.createElement('span');
      node.dataset.toggle = 'unknown-id';
      element._handleDisplayClick({
        target: node
      });
      // no error, coverage
    });

    it('Prevents default on anchor', () => {
      const node = document.createElement('a');
      node.href = '/test';
      let called = false;
      const e = {
        target: node,
        preventDefault: () => called = true,
        stopPropagation: () => {},
        stopImmediatePropagation: () => {}
      };
      element._handleDisplayClick(e);
      assert.isTrue(called);
    });

    it('Stops propagation on anchor', () => {
      const node = document.createElement('a');
      node.href = '/test';
      let called = false;
      const e = {
        target: node,
        preventDefault: () => {},
        stopPropagation: () => called = true,
        stopImmediatePropagation: () => {}
      };
      element._handleDisplayClick(e);
      assert.isTrue(called);
    });

    it('Stops immediate propagation on anchor', () => {
      const node = document.createElement('a');
      node.href = '/test';
      let called = false;
      const e = {
        target: node,
        preventDefault: () => {},
        stopPropagation: () => {},
        stopImmediatePropagation: () => called = true
      };
      element._handleDisplayClick(e);
      assert.isTrue(called);
    });

    it('Calls _dispatchChangeUrl()', () => {
      const node = document.createElement('a');
      node.href = '/test';
      const e = {
        target: node,
        preventDefault: () => {},
        stopPropagation: () => {},
        stopImmediatePropagation: () => {}
      };
      const spy = sinon.spy(element, '_dispatchChangeUrl');
      element._handleDisplayClick(e);
      assert.isTrue(spy.called);
    });

    it('Calls _dispatchNewRequest() for ctrlKey', () => {
      const node = document.createElement('a');
      node.href = '/test';
      const e = {
        target: node,
        preventDefault: () => {},
        stopPropagation: () => {},
        stopImmediatePropagation: () => {},
        ctrlKey: true
      };
      const spy = sinon.spy(element, '_dispatchNewRequest');
      element._handleDisplayClick(e);
      assert.isTrue(spy.called);
    });

    it('Calls _dispatchNewRequest() for metaKey', () => {
      const node = document.createElement('a');
      node.href = '/test';
      const e = {
        target: node,
        preventDefault: () => {},
        stopPropagation: () => {},
        stopImmediatePropagation: () => {},
        metaKey: true
      };
      const spy = sinon.spy(element, '_dispatchNewRequest');
      element._handleDisplayClick(e);
      assert.isTrue(spy.called);
    });
  });

  describe('a11y', () => {
    it('is accessible', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element);
    });
  });
});
