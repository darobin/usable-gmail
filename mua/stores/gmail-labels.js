
import { registerStore, getStore, derived } from '../lib/models';

let gmailLabelStore = derived(
  [getStore('gapi'), getStore('is-logged-in')],
  ([gapi, isLoggedIn], set) => {
    if (!gapi || !isLoggedIn) return set([]);
    gapi.client.gmail.users.labels.list({ userId: 'me' })
      .then((res) => {
        let { labels } = res.result;
        Promise.all(
            labels
              .filter(lb => lb.labelListVisibility !== 'labelHide' && lb.id !== 'UNREAD')
              .map(({ id }) => gapi.client.gmail.users.labels.get({ userId: 'me', id }))
          )
          .then(labs => {
            labs = labs
              .map(({ result }) => result)
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
            set(labs || []);
          })
          .catch((err) => {
            console.error(err);
            set([]);
          })
        ;
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
