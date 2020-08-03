/* eslint no-bitwise: 0, no-self-compare: 0 */
// XXX: this is copied from anti on 2020-08-03

import { LitElement } from 'lit-element';
import { getStore, getStoreName } from './models';

export * from 'lit-element';

export class AntiStoreElement extends LitElement {
  static get storeValueProperties () {
    return [
      // state of the store: unknown | loading | error | loaded
      'state',
      // a string describing an error
      'error',
      // a code (string or number) identifying an error
      'errorCode',
      // the following three are from progress events, progress happens in loading state
      'lengthComputable',
      'loaded',
      'total',
      // the actual value, which could be anything
      'value',
    ];
  }
  static get properties () {
    let props = {
      // the name of the store as found in the global registry
      store: {
        atttribute: true,
        converter: {
          fromAttribute: (val) => {
            try {
              return getStore(val);
            }
            catch (err) {
              console.error(`Failed to bind store ${val}`, err);
            }
          },
          toAttribute: (val) => getStoreName(val),
        },
        reflect: true,
      },
    };
    this.storeValueProperties.forEach(p => props[p] = { atttribute: false });
    return props;
  }
  update (props) {
    super.update(props);
    // console.log(`update`, props);
    if (props.has('store') && this.unsubscribeCallback) {
      this.unsubscribeCallback();
      this.unsubscribeCallback = null;
    }
  }
  updated (props) {
    super.updated(props);
    if (props.has('store')) {
      try {
        this.unsubscribeCallback = this.store.subscribe((update) => {
          AntiStoreElement.storeValueProperties.forEach(p => this[p] = update[p]);
        });
      }
      catch (err) {
        console.error(err);
      }
    }
  }
}
