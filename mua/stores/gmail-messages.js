
import { registerStore, getStore, derived } from '../lib/models';
import errorCatcher from '../lib/error-catcher';

let gmailMessageStore = derived(
  [getStore('gapi'), getStore('is-logged-in'), getStore('router')],
  ([gapi, isLoggedIn, router], set) => {
    if (!gapi || !isLoggedIn || !router || router.name !== 'mailbox') return set([]);
    gapi.client.gmail.users.messages.list({
      userId: 'me',
      maxResults: 5000, // XXX: for now we don't do paging
      labelIds: [router.params.id],
    })
      .then((res) => {
        let { messages } = res.result
          , batch = gapi.client.newBatch()
        ;
        console.log(`messages`, messages);
        messages
          .forEach(({ id }) => {
            batch.add(gapi.client.request({ path: `/gmail/v1/users/me/messages/${id}` }), { id });
          })
        ;
        // XXX:
        //  - this doesn't work because there is too much data
        //  - is it possible to limit which parts of the messages get loaded? no attachments, no
        //    snippets...
        //  - alternatively, we could load the threads to get the top level, and unfold to messages
        //    on demand. It might be slow but it won't overload.
        // batch
        //   .then(msgs => {
        //     msgs = Object.values(msgs.result).map(({ result }) => result);
        //     console.log(`threading…`, msgs);
        //     let threads = {};
        //     msgs.forEach(m => {
        //       if (!threads[m.threadId]) threads[m.threadId] = { messages: [] };
        //       threads[m.threadId].messages.push(msgs);
        //     });
        //     Object.keys(threads)
        //       .forEach(tid => {
        //         let th = threads[tid];
        //         th.messages = th.messages.sort(dateSort);
        //         th.internalDate = th.messages[th.messages.length - 1].internalDate;
        //         th.subject = getHeader(th.messages[0], 'Subject');
        //         th.from = getHeader(th.messages[0], 'From');
        //       })
        //     ;
        //     set(Object.values(threads).sort(dateSort) || []);
        //   })
        //   .catch(errorCatcher(set, []))
        // ;
      })
      .catch(errorCatcher(set, []))
    ;
  },
  []
);
registerStore('gmail-messages', gmailMessageStore);

function getHeader (msg, header = '') {
  let headers = (msg.payload || {}).headers || []
    , obj = headers.find(h => h.name.toLowerCase() === header.toLowerCase())
  ;
  if (!obj) return;
  return obj.value;
}

function dateSort (a, b) {
  if (a.internalDate < b.internalDate) return -1;
  if (a.internalDate > b.internalDate) return 1;
  return 0;
}
