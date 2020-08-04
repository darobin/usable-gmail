
import { registerStore, getStore, derived } from '../lib/models';

let auth2
  , userStore = derived(
      getStore('gapi'),
      (gapi, set) => {
        if (!gapi) return set(null);
        auth2 = gapi.auth2.getAuthInstance();
        auth2.isSignedIn.listen((signedIn) => {
          if (!signedIn) auth2.signIn();
        });
        if (!auth2.isSignedIn.get()) auth2.signIn();
        auth2.currentUser.listen((user) => set(user));
        set(auth2.currentUser.get());
      }
    )
;
userStore.logout = () => {
  if (!auth2) return;
  auth2.signOut();
};
registerStore('user', userStore);
