
import { LitElement, css, html } from 'lit-element';

class UsableMailboxesELement extends LitElement {
  static get styles () {
    return css`
      :host {
        background: deeppink;
        opacity: 0.2;
        grid-area: mbx;
      }
    `;
  }
  render () {
    return html`
      <span>mailboxes</span>
    `;
  }
}
customElements.define('usbl-mailboxes', UsableMailboxesELement);
