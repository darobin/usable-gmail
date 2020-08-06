
let Pouch = require('pouchdb')
  , { slurp } = require('./http-api')
  , Batch = require('./batch')
  , specialHistory = 'special:history-id'
  , batchPath = 'batch/gmail/v1'
;

module.exports = class DB {
  constructor () {
    this.db = new Pouch('usable');
  }
  async historyID (hid) {
    let doc;
    try {
      doc = await this.db.get(specialHistory);
    }
    catch (err) {
      doc = {
        _id: specialHistory,
        value: hid,
      };
    }
    console.log(`doc`, doc);
    if (hid) await this.db.put(doc);
    return doc.value;
  }
  async fullSync (progress, cb) {
    slurp(
      'messages',
      (update) => progress(`Slurped ${update.added} in message list, total: ${update.total}.`),
      (err, messages) => {
        if (err) return cb(err);
        // XXX: improvement
        // here we want to know which docs we already have
        // if we do, we can call the batch with format=MINIMAL, and then only update them with the
        // labelIds because that's what could have changed
        let b = new Batch(batchPath);
        messages.forEach(({ id }) => {
          b.get(
            id,
            `/gmail/v1/users/me/messages/${id}?fields=id,threadId,snippet,internalDate,payload/headers`
          );
        });
        // XXX: this is exceeding batches, I wonder what else we could do...
        b.run((err, data) => {
        });
      }
    );
    // get full list of messages
    // do a set of batches to get them
    //    fields=id,threadId,snippet,internalDate,payload/partId,payload/mimeType,payload/filename,
    //      payload/headers
    // convert them to the internal format & store
    // want to signal progress
    // when done, store the historyId of the *first* message in the list
  }
  async partialSync () {
    // call history.list with the historyID
    // if we get a 404, run a fullSync
    // retrieve the records, convert, store, update historyID
  }
};
