
import { registerStore, getStore, derived } from '../lib/models';

let gmailLabelStore = derived(
  [getStore('gapi'), getStore('is-logged-in')],
  ([gapi, isLoggedIn], set) => {
    if (!gapi || !isLoggedIn) return set([]);
    gapi.client.gmail.users.labels.list({ userId: 'me' })
      .then((res) => {
        let { labels } = res.result;
        set(labels || []);
      })
      .catch((err) => {
        console.error(err);
        set([]);
      })
    ;
  },
  []
);
registerStore('gmail-labels', gmailLabelStore);
