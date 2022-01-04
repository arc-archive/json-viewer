## Deprecation notice

This component is deprecated. Use `@advanced-rest-client/arc-response` instead.

## &lt;json-viewer&gt;

ARC JSON payload (HTTP response) viewer.


```html
<json-viewer json="..."></json-viewer>
```

## Usage

### Installation

```sh
npm install --save @advanced-rest-client/json-viewer
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@advanced-rest-client/json-viewer/json-viewer.js';
    </script>
  </head>
  <body>
    <json-viewer json="..."></json-viewer>
  </body>
</html>
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/json-viewer/json-viewer.js';

class SampleElement extends PolymerElement {
  render() {
    return html`
    <json-viewer .json="${this.json}"></json-viewer>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@advanced-rest-client/json-viewer/json-viewer.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <json-viewer json="[[json]]"></json-viewer>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Big numbers in JavaScript

This element marks all numbers that are above `Number.MAX_SAFE_INTEGER` value
and locates the numeric value in source json if passed json was a string or
when `raw` attribute was set. In this case it will display a warning and
explanation about use of big numbers in JavaScript.
See js-max-number-error element documentation for more information.

### Content actions

The element can render a actions pane above the code view. Action pane is to
display content actions that is relevan in context of the response displayed
below the icon buttons. It should be icon buttons or just buttons added to this
view.

Buttons needs to have `content-action` property set to be included to this view.

```
<json-viewer json='{"json": "test"}'>
  <paper-icon-button content-action title="Copy content to clipboard" icon="arc:content-copy"></paper-icon-button>
</json-viewer>
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/json-viewer
cd json-viewer
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests

```sh
npm test
```
