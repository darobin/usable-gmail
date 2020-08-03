/* global gapi */

import { registerStore, writable } from '../lib/models';
import clientID from '../lib/client-id';

let auth2;

let userStore = writable(null, (set) => {
  gapi.load('auth2', () => {
    auth2 = gapi.auth2.init({
      client_id: clientID,
      scope: 'profile https://mail.google.com/',
      ux_mode: 'popup',
    });
    auth2.isSignedIn.listen((signedIn) => {
      console.warn(`Signed-in? ${signedIn}`);
      if (!signedIn) auth2.signIn();
    });
    auth2.currentUser.listen((user) => {
      console.log(`User value: ${user}`, user);
      set(user);
    });
  });
});
userStore.logout = () => {
  if (!auth2) return;
  // XXX: we migth not need to pay attention to the promise resolution here as the listener might
  // do it already
  auth2
    .signOut()
    .then(() => userStore.set(null))
    .catch((err) => console.error(err))
  ;
};
registerStore('user', userStore);
