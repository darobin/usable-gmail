
import { LitElement, css, html } from 'lit-element';

class RBUsableELement extends LitElement {
  static get styles () {
    return css`
      :host {
        display: grid;
        grid-template:
          /* "bar bar" 80px
          "mbx mlist" 1fr / 250px 1fr
          "mbx msg" 2fr */
          "bar bar" 40px
          "mbx mlist" 1fr
          "mbx msg" 2fr / 200px 1fr
        ;
        height: 100vh;
      }
    `;
  }
  render () {
    return html`
      <usbl-top-bar></usbl-top-bar>
      <usbl-mailboxes></usbl-mailboxes>
      <usbl-messages></usbl-messages>
      <usbl-message-view></usbl-message-view>
    `;
  }
}
customElements.define('rb-usable', RBUsableELement);
