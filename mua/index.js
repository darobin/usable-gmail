
let express = require('express')
  , { join } = require('path')
  , compression = require('compression')
  , { google } = require('googleapis')
  , axios = require('axios')
  , { nanoid } = require('nanoid')
  , app = express()
  , clientID = '564300876279-vduinvjp384lvuusnhtfbgjut1ker4fa.apps.googleusercontent.com'
  , auth = new google.auth.OAuth2(clientID)
  , base = `https://www.googleapis.com/gmail/v1/users/me/`
  , batchPath = 'batch/gmail/v1'
  , tokenType
  , accessToken
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

// here is the API
app.post('/api/set-credentials', express.json(), (req, res) => {
  let { credentials } = req.body;
  auth.verifyIdToken({
      idToken: credentials.id_token,
      audience: clientID,
    })
    .then(() => {
      auth.setCredentials(credentials);
      tokenType = credentials.token_type;
      accessToken = credentials.access_token;
      res.json({ ok: true });
    })
    .catch(err => sendError(res, err))
  ;
});

function hasTokens (req, res, next) {
  if (!tokenType || !accessToken) return sendError(res, new Error('No tokens'));
  next();
}

app.get('/api/mailboxes', hasTokens, (req, res) => {
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

app.get('/api/messages/:mailbox', hasTokens, (req, res) => {
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
app.listen(7777, () => {
  console.warn(`Usable running: http://usable-gmail.berjon.com:7777/`);
});

function options (extraHeaders = {}) {
  return ({
    headers: {
      ...extraHeaders,
      authorization: `${tokenType} ${accessToken}`,
    },
  });
}

function get (path, cb) {
  axios.get(`${base}${path}`, options())
    .then(res => cb(null, res.data))
    .catch(cb)
  ;
}

class Batch {
  constructor (batchEndpoint) {
    this.sep = nanoid();
    this.parts = [];
    this.batchPath = batchEndpoint;
  }
  get (id, path) {
    this.add(id, 'GET', path);
  }
  post (id, path) {
    this.add(id, 'POST', path);
  }
  add (id, method, path) {
    this.parts.push(`--${this.sep}
Content-Type: application/http
Content-ID: <${id}>

${method} ${path}

`);
  }
  body () {
    return this.parts.join('') + `--${this.sep}--\n`;
  }
  run (cb) {
    let body = this.body();
    axios.post(
        `https://www.googleapis.com/${this.batchPath}`,
        body,
        options({
          'content-type': `multipart/mixed; boundary=${this.sep}`,
          'content-length': body.length,
        })
      )
      .then(res => {
        let mime = res.data
          , [, sep] = mime.match(/\s*(--\S+)/)
          , parts = mime.split(sep).map(s => s.trim()).filter(Boolean).filter(str => !/^\s*--\s*$/.test(str))
          , results = {}
        ;
        parts.forEach(p => {
          let [prefix, headers, payload] = p.split('\r\n\r\n', 3).filter(Boolean)
            , [, contentID] = prefix.match(/Content-ID:\s*<response-([^>]+)>/i)
            , [, code] = headers.match(/HTTP\/1\.1 (\d+)/)
            , [, type] = headers.match(/Content-Type:\s*([^;]+)/i)
            , value
          ;
          if (code !== '200') value = new Error(`Failed batched request:\n${prefix}\n${headers}\n${payload}`);
          else if (type.toLowerCase() !== 'application/json') value = payload;
          else value = JSON.parse(payload);
          results[contentID] = value;
        });
        cb(null, results);
      })
      .catch(cb)
    ;
  }
}

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
