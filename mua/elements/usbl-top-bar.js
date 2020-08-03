
import { LitElement, css, html } from 'lit-element';

class UsableTopBarELement extends LitElement {
  static get styles () {
    return css`
      :host {
        background: darkorange;
        opacity: 0.2;
        grid-area: bar;
      }
    `;
  }
  render () {
    return html`
      <span>top bar</span>
    `;
  }
}
customElements.define('usbl-top-bar', UsableTopBarELement);
