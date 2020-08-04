
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
    this.messagesStore.subscribe((msgs) => this.messages = msgs);
  }
  static get styles () {
    return css`
      :host {
        grid-area: mlist;
        border-bottom: 1px solid #e2e2e2;
        overflow: auto;
      }
    `;
  }
  render () {
    return html`
      <pre>${JSON.stringify(this.messages, null, 2)}</pre>
    `;
  }
}
customElements.define('usbl-messages', UsableMessagesELement);
