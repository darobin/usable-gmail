
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
module.exports = { options, setToken, get };
