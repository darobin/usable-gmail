
let express = require('express')
  , { join } = require('path')
  , compression = require('compression')
  , Batch = require('./server/batch')
  , GoogleAuth = require('./server/google-auth')
  , credentials = require('./credentials.json')
  , scope = [
      'https://mail.google.com/',
    ]
  , gauth = new GoogleAuth({ credentials, scope, tokenPath: join(__dirname, 'token.json') })
  , { setToken, get } = require('./server/http-api')
  , app = express()
  , batchPath = 'batch/gmail/v1'
  , oAuthClient
  , sendError = (res, err) => {
      console.error(err);
      res.status(500).json({ ok: false, error: err });
    }
;

app.use((req, res, next) => {
  if (req.connection.remoteAddress !== '::ffff:127.0.0.1') {
    return sendError(res, new Error('Only local connections are accepted.'));
  }
  next();
});

app.use(compression());

app.get('/api/mailboxes', (req, res) => {
  get('labels', (err, { labels } = {}) => {
    let b = new Batch(batchPath);
    labels
      .filter(lb => lb.labelListVisibility !== 'labelHide' && lb.id !== 'UNREAD')
      .forEach(({ id }) => b.get(id, `/gmail/v1/users/me/labels/${id}`))
    ;
    b.run((err, data) => {
      if (err) return sendError(res, err);
      res.json({ ok: true, data: Object.values(data) });
    });
  });
});

app.get('/api/messages/:mailbox', (req, res) => {
  let mbx = req.params.mailbox
    , maxMessages = 100
  ;
  if (!/^\w+$/.test(mbx)) return sendError(res, new Error(`Wrong format: ${mbx}`));
  get(`messages?maxResults=${maxMessages}&labelIds=${mbx}`, (err, { messages }) => {
    if (err) return sendError(res, err);
    let b = new Batch(batchPath);
    messages.forEach(({ id }) => {
      // if (idx) return;
      b.get(
        id,
        `/gmail/v1/users/me/messages/${id}?fields=id,threadId,snippet,internalDate,payload/partId,payload/mimeType,payload/filename,payload/headers`
      );
    });
    // XXX: this is exceeding batches, I wonder what else we could do...
    b.run((err, data) => {
      if (err) return sendError(res, err);
      console.log(data);
      let msgs = Object.values(data)
        , threads = {}
      ;
      msgs.forEach(m => {
        if (!threads[m.threadId]) threads[m.threadId] = { messages: [] };
        threads[m.threadId].messages.push(msgs);
      });
      Object.keys(threads)
        .forEach(tid => {
          let th = threads[tid];
          th.messages = th.messages.sort(dateSort);
          th.internalDate = th.messages[th.messages.length - 1].internalDate;
          th.subject = getHeader(th.messages[0], 'Subject');
          th.from = getHeader(th.messages[0], 'From');
        })
      ;
      res.json({ ok: true, data: Object.values(threads).sort(dateSort) });
    });
  });
});

app.use(express.static(join(__dirname, 'public')));

gauth.auth((err, token, auth) => {
  if (err) return console.error(err);
  console.warn(`Successfully authenticated with token.\n${JSON.stringify(token, null, 2)}`);
  setToken(token);
  oAuthClient = auth;
  app.listen(7777, () => {
    console.warn(`Usable running: http://usable-gmail.berjon.com:7777/`);
  });
});

function dateSort (a, b) {
  if (a.internalDate < b.internalDate) return -1;
  if (a.internalDate > b.internalDate) return 1;
  return 0;
}

function getHeader (msg, header = '') {
  let headers = (msg.payload || {}).headers || []
    , obj = headers.find(h => h.name.toLowerCase() === header.toLowerCase())
  ;
  if (!obj) return;
  return obj.value;
}
