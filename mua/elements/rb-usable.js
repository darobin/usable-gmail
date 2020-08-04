
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
    this.loggedInStore = getStore('is-logged-in');
    this.loggedInStore.subscribe((isLoggedIn) => this.loggedIn = isLoggedIn);
  }
  static get styles () {
    return css`
      :host {
        display: grid;
        grid-template:
          "bar bar" 40px
          "mbx mlist" 1fr
          "mbx msg" 2fr / 250px 1fr
        ;
        height: 100vh;
      }
      .loading {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--highlight);
        background: #333;
        font-family: karnak-cond-normal-700;
        font-size: 1.5rem;
      }
      .loading img {
        margin-right: 5px;
      }
    `;
  }
  render () {
    if (!this.loggedIn) {
      return html`
        <div class="loading">
          <img src="/img/bird.svg" width="36" height="36" alt="Usable Gmail Logo">
          <span>Loading…</span>
        </div>`;
    }
    return html`
      <usbl-top-bar></usbl-top-bar>
      <usbl-mailboxes></usbl-mailboxes>
      <usbl-messages></usbl-messages>
      <usbl-message-view></usbl-message-view>
    `;
  }
}
customElements.define('rb-usable', RBUsableELement);
