
import { registerStore, getStore, derived } from '../lib/models';
import errorCatcher from '../lib/error-catcher';
import { get } from '../lib/backend';

let gmailMessageStore = derived(
  [getStore('is-logged-in'), getStore('router')],
  ([isLoggedIn, router], set) => {
    if (!isLoggedIn || !router || router.name !== 'mailbox') return set([]);
    get(`messages/${router.params.id}`, (err, messages) => {
      if (err) errorCatcher(set, [])(err);
      set(messages || []);
    });
  },
  []
);
registerStore('gmail-messages', gmailMessageStore);
