
let { nanoid } = require('nanoid')
  , axios = require('axios')
  , { options } = require('./http-api')
  , maxInBatch = 100
;

module.exports = class Batch {
  constructor (batchEndpoint, sep, parts) {
    this.batchPath = batchEndpoint;
    this.sep = sep || nanoid();
    this.parts = parts || [];
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
  runSplintered (cb) {
    let batches = [];
    while (this.parts.length > maxInBatch) {
      batches.push(this.parts.slice(0, maxInBatch));
      this.parts = this.parts.slice(maxInBatch);
    }
    batches.push(this.parts);
    // XXX:
    //  process them in turn, collate, and return that
  }
  run (cb) {
    // we want to make sure that each batch is no bigger than a maximum size
    if (this.parts.length > maxInBatch) return this.runSplintered(cb);
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
};
