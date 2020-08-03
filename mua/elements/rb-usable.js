
import { LitElement, css, html } from 'lit-element';
import { getStore } from '../lib/models';

class RBUsableELement extends LitElement {
  static get properties () {
    return ({
      loggedIn: { atttribute: false },
    });
  }
  initialize () {
    super.initialize();
    this.userStore = getStore('user');
    this.userStore.subscribe((user) => {
      this.loggedIn = user && user.isSignedIn();
    });
  }
  static get styles () {
    return css`
      :host {
        display: grid;
        grid-template:
          "bar bar" 40px
          "mbx mlist" 1fr
          "mbx msg" 2fr / 200px 1fr
        ;
        height: 100vh;
      }
    `;
  }
  render () {
    if (!this.loggedIn) return html`<span>Loading…</span>`;
    return html`
      <usbl-top-bar></usbl-top-bar>
      <usbl-mailboxes></usbl-mailboxes>
      <usbl-messages></usbl-messages>
      <usbl-message-view></usbl-message-view>
    `;
  }
}
customElements.define('rb-usable', RBUsableELement);
