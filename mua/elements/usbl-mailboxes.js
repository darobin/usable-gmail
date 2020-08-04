
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
      }
    `;
  }
  render () {
    return html`
      <pre>${JSON.stringify(this.labels, null, 2)}</pre>
    `;
  }
}
customElements.define('usbl-mailboxes', UsableMailboxesELement);
