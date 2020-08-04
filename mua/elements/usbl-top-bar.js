
import { LitElement, css, html } from 'lit-element';
import { getStore } from '../lib/models';

class UsableTopBarELement extends LitElement {
  static get properties () {
    return ({
      picture: { atttribute: false },
      givenName: { atttribute: false },
    });
  }
  initialize () {
    super.initialize();
    this.userStore = getStore('user');
    this.userStore.subscribe((user) => {
      let picture
        , givenName
      ;
      if (user) {
        let profile = user.getBasicProfile();
        if (profile) {
          picture = profile.getImageUrl();
          givenName = profile.getGivenName();
        }
      }
      this.picture = picture;
      this.givenName = givenName;
    });
  }
  static get styles () {
    return css`
      :host {
        grid-area: bar;
        display: flex;
        justify-content: space-between;
        padding: 2px;
        border-bottom: 1px solid #e2e2e2;
      }
      .logo-name {
        display: flex;
      }
      .logo-name > img {
        margin: 5px 0 5px 5px;
        height: 30px;
      }
      .logo-name > .name {
        border-left: 1px solid hotpink;
        line-height: 0.6;
        display: inline-block;
        padding: 6px 3px 3px 3px;
        font-family: karnak-normal-700, karnak-cond-normal-700;
        color: var(--highlight);
        font-size: 1.5rem;
        height: 16px;
        margin-top: 7px;
      }
      .user-bar > img {
        vertical-align: middle;
      }
    `;
  }
  render () {
    return html`
      <span class="logo-name">
        <img src="/img/bird.svg" width="36" height="36" alt="Usable Gmail Logo">
        <span class="name">Usable</span>
      </span>
      ${
        (this.picture && this.givenName)
          ? html`
            <span class="user-bar">
              <usbl-logout-button></usbl-logout-button>
              <img src=${this.picture} width="36" height="36" alt=${this.givenName}>
            </span>
          `
          : html``
      }
    `;
  }
}
customElements.define('usbl-top-bar', UsableTopBarELement);
