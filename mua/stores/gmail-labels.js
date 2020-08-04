/* global gapi */

import { registerStore, getStore, derived } from '../lib/models';

let gmailLabelStore = derived(
  getStore('is-logged-in'),
  (loggedIn, set) => {
    if (!loggedIn) return set([]);
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
