
import { LitElement, css, html } from 'lit-element';
import { getStore } from '../lib/models';

class UsableMailboxesELement extends LitElement {
  static get properties () {
    return ({
      labels: { atttribute: false },
    });
  }
  initialize () {
    super.initialize();
    this.labelsStore = getStore('gmail-labels');
    this.labelsStore.subscribe((labels) => {
      this.labels = labels;
    });
  }
  static get styles () {
    return css`
      :host {
        grid-area: mbx;
        overflow: auto;
        font-family: franklin;
        border-right: 1px solid #e2e2e2;
      }
      a {
        text-decoration: none;
        color: #333;
        display: block;
      }
      .icon {
        display: inline-block;
        margin-right: 0.2rem;
      }
      ul {
        list-style-type: none;
        padding-left: 0.8rem;
      }
    `;
  }
  render () {
    return html`
      <ul>
        ${this.labels.map(({ id, name }) => html`
          <li><a href=${`#${id}`}>${getIcon(id)} ${name}</a></li>
        `)}
      </ul>
    `;
  }
}
customElements.define('usbl-mailboxes', UsableMailboxesELement);

let icons = {
  INBOX: '📥',
  DRAFT: '📝',
  SENT: '📤',
  SPAM: '🥫',
  TRASH: '🗑',
};
function getIcon (id) {
  return html`<span class="icon">${icons[id] || '📁'}</span>`;
}
