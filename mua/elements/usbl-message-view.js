
import { LitElement, css, html } from 'lit-element';

class UsableMessageViewELement extends LitElement {
  static get styles () {
    return css`
      :host {
        background: lime;
        opacity: 0.2;
        grid-area: msg;
      }
    `;
  }
  render () {
    return html`
      <span>message view</span>
    `;
  }
}
customElements.define('usbl-message-view', UsableMessageViewELement);
