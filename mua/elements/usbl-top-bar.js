
import { LitElement, css, html } from 'lit-element';

class UsableTopBarELement extends LitElement {
  static get styles () {
    return css`
      :host {
        grid-area: bar;
      }
    `;
  }
  render () {
    return html`
      <usbl-logout-button></usbl-logout-button>
    `;
  }
}
customElements.define('usbl-top-bar', UsableTopBarELement);
