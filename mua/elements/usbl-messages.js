
import { LitElement, css, html } from 'lit-element';
import { getStore } from '../lib/models';

class UsableMessagesELement extends LitElement {
  static get properties () {
    return ({
      messages: { atttribute: false },
    });
  }
  initialize () {
    super.initialize();
    this.messagesStore = getStore('gmail-messages');
    this.messagesStore.subscribe((msgs) => this.messagesStore = msgs);
  }
  static get styles () {
    return css`
      :host {
        grid-area: mlist;
        border-bottom: 1px solid #e2e2e2;
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
