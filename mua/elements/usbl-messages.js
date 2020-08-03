
import { LitElement, css, html } from 'lit-element';

class UsableMessagesELement extends LitElement {
  static get styles () {
    return css`
      :host {
        background: cornflowerblue;
        opacity: 0.2;
        grid-area: mlist;
      }
    `;
  }
  render () {
    return html`
      <span>messages</span>
    `;
  }
}
customElements.define('usbl-messages', UsableMessagesELement);
