/* global gapi */

import { registerStore, writable } from '../lib/models';
import clientID from '../lib/client-id';

let auth2;

let userStore = writable(null, (set) => {
  gapi.load('auth2', () => {
    auth2 = gapi.auth2.init({
      client_id: clientID,
      scope: 'profile https://mail.google.com/',
      ux_mode: 'redirect',
    });
    auth2.isSignedIn.listen((signedIn) => {
      console.warn(`Signed-in? ${signedIn}`);
      if (!signedIn) auth2.signIn();
    });
    auth2.currentUser.listen((user) => set(user));
  });
});
userStore.logout = () => {
  if (!auth2) return;
  auth2.signOut();
};
registerStore('user', userStore);
