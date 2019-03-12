/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import {dom} from '@polymer/polymer/lib/legacy/polymer.dom.js';
import '@polymer/paper-spinner/paper-spinner.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import './js-max-number-error.js';
import {JsonParser} from './json-parser.js';
/**
 * `<json-viewer>` A JSON payload viewer for the JSON response.
 *
 * This element uses a web worker to process the JSON data.
 * To simplify our lives and app build process the worker script is embeded in the
 * imported template body. It will extract worker data from it and create the
 * worker. Otherwise build process would need to incude a worker script file
 * into set path which is not very programmer friendly.
 *
 * ### Example
 *
 * ```html
 * <json-viewer json='{"json": "test"}'></json-viewer>
 * ```
 *
 * ## Custom search
 *
 * If the platform doesn't support native text search, this element implements
 * `ArcBehaviors.TextSearchBehavior` and exposes the `query` attribute.
 * Set any text to the `query` attribute and it will automatically highlight
 * occurance of the text.
 * See demo for example.
 *
 * ## Big numbers in JavaScript
 *
 * This element marks all numbers that are above `Number.MAX_SAFE_INTEGER` value
 * and locates the numeric value in source json if passed json was a string or
 * when `raw` attribute was set. In this case it will display a warning and
 * explanation about use of big numbers in JavaScript.
 * See js-max-number-error element documentation for more information.
 *
 * ## Content actions
 *
 * The element can render a actions pane above the code view. Action pane is to
 * display content actions that is relevan in context of the response displayed
 * below the icon buttons. It should be icon buttons or just buttons added to this
 * view.
 *
 * ```html
 * <json-viewer json='{"json": "test"}'>
 *  <paper-icon-button slot="content-action"
 *    title="Copy content to clipboard" icon="arc:content-copy"></paper-icon-button>
 * </json-viewer>
 * ```
 *
 * ### Styling
 *
 * `<json-viewer>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--json-viewer` | Mixin applied to the element | `{}`
 * `--code-type-null-value-color` | Color of the null value. | `#708`
 * `--code-type-boolean-value-color` | Color of the boolean value | `#708`
 * `--code-punctuation-value-color` | Punctuation color. | `black`
 * `--code-type-number-value-color` | Color of the numeric value | `blue`
 * `--code-type-text-value-color` | Color of the string value. | `#48A`
 * `--code-array-index-color` | Color of the array counter. | `rgb(119, 119, 119)`
 * `--code-type-link-color` | Color of link inserted into the viewer. | `#1976d2`
 * `--json-viewer-node` | Mixin applied to a "node" | `{}`
 * `--code-dimmed-punctuation-opacity` | Value of the opacity on the "dimmed" punctuation | `0.34`
 * `--code-background-color` | Background color of the code area | ``
 *
 * @group UiElements
 * @element json-viewer
 * @demo demo/index.html
 */
class JsonViewer extends PolymerElement {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      font-family: monospace;
      font-size: 10pt;
      color: black;
      cursor: text;
      -webkit-user-select: text;
      @apply --arc-font-code1;
      @apply --json-viewer;
    }

    .prettyPrint {
      padding: 8px;
    }

    .stringValue {
      white-space: normal;
    }

    .brace {
      display: inline-block;
    }

    .numeric {
      color: var(--code-type-number-value-color, blue);
    }

    .nullValue {
      color: var(--code-type-null-value-color, #708);
    }

    .booleanValue {
      color: var(--code-type-boolean-value-color, #708);
    }

    .punctuation {
      color: var(--code-punctuation-value-color, black);
    }

    .stringValue {
      color: var(--code-type-text-value-color, #48A);
    }

    .node {
      position: relative;
      white-space: nowrap;
      margin-bottom: 4px;
      word-wrap: break-word;
      @apply --json-viewer-node;
    }

    .array-counter {
      color: gray;
      font-size: 11px;
    }

    .array-counter::before {
      content: "Array[" attr(count) "]";
      user-select: none;
      pointer-events: none;
    }

    *[data-expanded="false"] > .array-counter::before {
      content: "Array[" attr(count) "] ...";
      user-select: none;
      pointer-events: none;
    }

    .array-key-number::before {
      content: "" attr(index) ":";
      user-select: none;
      pointer-events: none;
    }

    .key-name {
      color: var(--code-type-text-value-color, #48A);
    }

    .rootElementToggleButton {
      position: absolute;
      top: 0;
      left: -9px;
      font-size: 14px;
      cursor: pointer;
      font-weight: bold;
      user-select: none;
    }

    .rootElementToggleButton::after {
      content: "-";
    }

    .array-key-number {
      color: var(--code-array-index-color, rgb(119, 119, 119));
    }

    .info-row {
      display: none;
      margin: 0 8px;
      text-indent: 0;
    }

    div[data-expanded="false"] div[collapse-indicator] {
      display: inline-block !important;
    }

    div[data-expanded="false"] div[data-element] {
      display: none !important;
    }

    .arc-search-mark.selected {
      background-color: #ff9632;
    }

    div[data-expanded="false"] .punctuation.dimmed {
      opacity: 0;
    }

    .dimmed {
      opacity: var(--code-dimmed-punctuation-opacity, 0.34);
    }

    a[response-anchor] {
      color: var(--code-type-link-color, #1976d2);
    }

    paper-spinner:not([active]) {
      display: none;
    }

    .actions-panel {
      @apply --layout-horizontal;
      @apply --layout-center;
      @apply --response-raw-viewer-action-bar;
    }

    .actions-panel.hidden {
      display: none;
    }

    [hidden] {
      display: none !important;
    }

    output {
      display: block;
      background-color: var(--code-background-color);
    }
    </style>
    <paper-spinner active="[[working]]"></paper-spinner>
    <template is="dom-if" if="[[isError]]">
      <div class="error">
        <p>There was an error parsing JSON data</p>
      </div>
    </template>
    <div class\$="[[_computeActionsPanelClass(showOutput)]]">
      <slot name="content-action"></slot>
    </div>
    <output hidden\$="[[!showOutput]]" on-click="_handleDisplayClick"></output>`;
  }

  static get properties() {
    return {
      /**
       * JSON data to parse and display.
       * It can be either JS object (already parsed string) or string value.
       * If the passed object is a string then JSON.parse function will be
       * used to parse string.
       */
      json: {
        type: String,
        observer: '_changed'
      },
      /**
       * If it's possible, set this property to the JSON string.
       * It will help to handle big numbers that are not parsed correctly by
       * the JSON.parse function. The parser will try to locate the number
       * in the source string and display it in the correct form.
       *
       * P.S.
       * Calling JSON.stringify on a JS won't help here :) Must be source
       * string.
       */
      raw: String,
      /**
       * True if error ocurred when parsing the `json` data.
       * An error message will be displayed.
       */
      isError: {
        type: Boolean,
        readOnly: true,
        value: false,
        notify: true
      },
      /**
       * True when JSON is beeing parsed.
       */
      working: {
        type: Boolean,
        readOnly: true,
        value: false,
        notify: true
      },
      /**
       * True when output should be shown (JSON has been parsed without errors)
       */
      showOutput: {
        type: Boolean,
        readOnly: true,
        value: false,
        computed: '_computeShowOutput(working, isError, json)'
      },
      // If true then it prints the execution time to the console.
      debug: Boolean
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._isReady = true;
    if (this.json) {
      this._changed(this.json);
    }
  }

  _clearOutput() {
    const node = this.shadowRoot.querySelector('output');
    node.innerHTML = '';
  }

  _writeOutput(text) {
    const node = this.shadowRoot.querySelector('output');
    node.innerHTML = text;
  }

  // Called when `json` property changed. It starts parsing the data.
  _changed(json) {
    if (!this._isReady) {
      return;
    }
    this._setIsError(false);
    this._clearOutput();
    if (json === undefined) {
      return;
    }
    if (json === null) {
      this._printPrimitiveValue('null', 'nullValue');
      return;
    }
    if (json === false || json === true) {
      this._printPrimitiveValue(String(json), 'booleanValue');
      return;
    }
    this._setWorking(true);

    try {
      const parser = new JsonParser({
        json,
        raw: this.raw,
        cssPrefix: this.nodeName.toLowerCase() + ' style-scope ',
        debug: this.debug
      });
      if (parser.latestError !== null) {
        throw new Error(parser.latestError);
      }
      const html = parser.getHTML();
      this._reportResult(html);
      if (this.debug) {
        const measurement = parser.getMeasurements();
        this._dumpMeasurements(measurement);
      }
    } catch (cause) {
      this._reportError(cause);
    }
  }

  _printPrimitiveValue(value, klas) {
    const html = `<div class="prettyPrint"><span class="${klas}">${value}</span></div>`;
    this._writeOutput(html);
    this._setShowOutput(true);
  }

  _dumpMeasurements(measurements) {
    if (!this.debug || !measurements) {
      return;
    }
    if (measurements.items && measurements.items.length) {
      console.groupCollapsed('JSON viewer parse measurements');
      console.table(measurements.items);
      console.groupEnd();
    }
  }

  _reportResult(html) {
    this._writeOutput(html);
    this._setIsError(false);
    this._setWorking(false);
    this.dispatchEvent(new CustomEvent('json-viewer-parsed', {}));
  }

  // Called when workr error received.
  _reportError(cause) {
    console.warn(cause);

    this._setIsError(true);
    this._setWorking(false);
    this.dispatchEvent(new CustomEvent('json-viewer-parsed', {}));
  }
  // Compute if output should be shown.
  _computeShowOutput(working, isError, json) {
    if (working) {
      return false;
    }
    if (isError) {
      return true;
    }
    return !!json && json !== null && json !== false;
  }
  // Called when the user click on the display area. It will handle view toggle and links clicks.
  _handleDisplayClick(e) {
    if (!e.target) {
      return;
    }

    if (e.target.nodeName === 'A') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const newEntity = e.ctrlKey || e.metaKey;
      this.dispatchEvent(new CustomEvent('url-change-action', {
        detail: {
          url: e.target.getAttribute('href'),
          asNew: newEntity
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }));
      return;
    }
    const toggleId = e.target.dataset.toggle;
    if (!toggleId) {
      return;
    }
    const parent = dom(this.root)
      .querySelector('div[data-element="' + toggleId + '"]');
    if (!parent) {
      return;
    }
    const expanded = parent.dataset.expanded;
    if (!expanded || expanded === 'true') {
      parent.dataset.expanded = 'false';
    } else {
      parent.dataset.expanded = 'true';
    }
  }
  /**
   * Computes CSS class for the actions pane.
   *
   * @param {Boolean} showOutput The `showOutput` propety value of the element.
   * @return {String} CSS class names for the panel depending on state of the
   * `showOutput`property.
   */
  _computeActionsPanelClass(showOutput) {
    let clazz = 'actions-panel';
    if (!showOutput) {
      clazz += ' hidden';
    }
    return clazz;
  }
  /**
   * Event called when the user click on the anchor in display area.
   *
   * @event url-change-action
   * @param {String} url The URL handled by this event.
   * @param {Boolean} asNew When true it should be treated as "new tab" action.
   */
  /**
   * Fired when web worker finished work and the data are displayed.
   *
   * @event json-viewer-parsed
   */
}
window.customElements.define('json-viewer', JsonViewer);
