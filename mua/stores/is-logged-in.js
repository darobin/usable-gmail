
import { registerStore, getStore, derived } from '../lib/models';
import { post } from '../lib/backend';

let loggedInStore = derived(
  getStore('user'),
  (user, set) => {
    if (user && user.isSignedIn()) {
      let credentials = user.getAuthResponse();
      console.warn(user.getAuthResponse());
      post('set-credentials', { credentials }, (err, res) => {
        if (err || !res.ok) {
          set(false);
          console.error(err || res.error);
          return;
        }
        set(true);
      });
    }
  },
  false
);
registerStore('is-logged-in', loggedInStore);
