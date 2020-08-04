
import { registerStore, getStore, derived } from '../lib/models';

let loggedInStore = derived(getStore('user'), (user) => user && user.isSignedIn(), false);
registerStore('is-logged-in', loggedInStore);
