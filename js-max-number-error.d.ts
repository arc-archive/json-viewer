import { LitElement } from 'lit-element';

declare class JsMaxNumberError extends LitElement {

  /**
   * A number that is expected to be true.
   */
  expectedNumber: string|null|undefined;
  constructor();
  connectedCallback(): void;
  disconnectedCallback(): void;
  render(): any;

  /**
   * Toggles the collapse element.
   */
  toggle(): void;
  _keyDown(e: any): void;
}

declare global {
  interface HTMLElementTagNameMap {
    "js-max-number-error": JsMaxNumberError;
  }
}
