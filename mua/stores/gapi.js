/* global gapi */

import { registerStore, writable } from '../lib/models';
import clientID from '../lib/client-id';
import scope from '../lib/scopes';

let gapiStore = writable(
  null,
  (set) => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
          client_id: clientID,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
          scope,
          ux_mode: 'redirect',
        })
        .then(() => set(gapi))
        .catch((err) => {
          console.error(err);
          set(null);
        })
      ;
    });
  }
);
registerStore('gapi', gapiStore);
