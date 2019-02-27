/**
@license
Copyright 2016 The Advanced REST client authors <arc@mulesoft.com>
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
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/iron-icon/iron-icon.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';

class JsMaxNumberError extends PolymerElement {
  static get template() {
    return html`
    <style>
    :host {
      display: inline-block;
      vertical-align: text-bottom;
    }
    .parsed-value ::slot > * {
      color: #D32F2F;
      font-weight: 500;
    }
    .content {
      @apply --layout-horizontal;
      @apply --layout-center;
      color: #D32F2F;
      font-weight: 500;
      cursor: pointer;
    }

    iron-icon {
      height: 18px;
      width: 18px;
      margin-right: 8px;
    }

    #collapse {
      white-space: initial;
      @apply --paper-font-body2;
      color: rgba(0, 0, 0, 0.74);
    }

    p {
      margin: 0;
    }

    .message {
      padding: 12px;
      background-color: #FFECB3;
      margin: 12px 24px;
    }

    .expected {
      font-weight: 700;
    }
    </style>
    <div class="content" on-tap="toggle">
      <iron-icon icon="arc:info"></iron-icon>
      <div class="parsed-value">
        <slot></slot>
      </div>
    </div>
    <iron-collapse>
      <div class="message">
        <p>The number used in the response is unsafe in JavaScript environment and therefore as a JSON value.</p>
        <p>Original value for the number (represented as string) is <span class="expected">"[[expectedNumber]]"</span></p>
        <p>This number will not work in web environment and should be passed as a string, not a number.</p>
        <p><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER" target="_blank">Read more about numbers in JavaScript</a>.</p>
      </div>
    </iron-collapse>
`;
  }

  static get properties() {
    return {
      // A number that is expected to be true.
      expectedNumber: {
        type: String,
        value: '[unknown]'
      }
    };
  }
  // Toggles the collapse element.
  toggle() {
    this.shadowRoot.querySelector('iron-collapse').toggle();
  }
}
window.customElements.define('js-max-number-error', JsMaxNumberError);
