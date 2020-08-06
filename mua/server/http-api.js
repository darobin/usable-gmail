
let axios = require('axios')
  , base = `https://www.googleapis.com/gmail/v1/users/me/`
  , tokenType
  , accessToken
;

function setToken (token) {
  tokenType = token.token_type;
  accessToken = token.access_token;
}

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

function slurp (path, progress, cb) {
  let results = []
    , field = path.replace(/\?.*/, '')
    , hasQS = /\?/.test(path)
    , getPage = (pageToken) => {
        let getPath = `${path}${hasQS ? '&' : '?'}${pageToken ? `pageToken=${pageToken}` : ''}`;
        get(getPath, (err, data) => {
          if (err) return cb(err);
          results = results.concat(data[field]);
          if (progress) progress({ added: data[field].length, total: results.length });
          if (data.nextPageToken) return getPage(data.nextPageToken);
          cb(null, results);
        });
      }
  ;
  getPage();
}

module.exports = { options, setToken, get, slurp };
