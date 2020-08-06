
import { registerStore, getStore, derived } from '../lib/models';
import errorCatcher from '../lib/error-catcher';
import { get } from '../lib/backend';

let gmailLabelStore = derived(
  getStore('is-logged-in'),
  (isLoggedIn, set) => {
    if (!isLoggedIn) return set([]);
    get('mailboxes', (err, labels) => {
      if (err) errorCatcher(set, [])(err);
      labels = labels.data
        .sort((a, b) => {
          if (a.type === 'system' && b.type !== 'system') return -1;
          if (a.type !== 'system' && b.type === 'system') return 1;
          if (a.type === 'system' && a.id === 'INBOX') return -1;
          if (b.type === 'system' && b.id === 'INBOX') return 1;
          return a.name.localeCompare(b.name);
        })
        .map(lb => {
          if (lb.type !== 'system') return lb;
          return (
            { ...lb, name: lb.name.charAt(0).toUpperCase() + lb.name.slice(1).toLowerCase() }
          );
        })
      ;
      set(labels || []);
    });
  },
  []
);
registerStore('gmail-labels', gmailLabelStore);
