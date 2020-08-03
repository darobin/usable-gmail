
import { LitElement, css, html } from 'lit-element';
import { getStore } from '../lib/models';

class UsableLogoutButtonELement extends LitElement {
  initialize () {
    super.initialize();
    this.userStore = getStore('user');
  }
  static get styles () {
    return css`
    `;
  }
  handleLogOut () {
    console.warn(`logging out`, this, this.userStore);
    if (!this.userStore) return;
    this.userStore.logout();
  }
  render () {
    return html`
      <button type="button" class="logout" @click=${this.handleLogOut}>Log Out</button>
    `;
  }
}
customElements.define('usbl-logout-button', UsableLogoutButtonELement);
