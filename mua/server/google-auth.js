
let { readFile, writeFile } = require('fs')
  , { createInterface } = require('readline')
  , { google } = require('googleapis')
  , open = require('open')
;

module.exports = class GoogleAuth {
  constructor ({ credentials, tokenPath, scope }) {
    this.oAuth2Client = null;
    [credentials, tokenPath, scope].forEach(it => {
      if (!it) throw new Error(`Required for auth: credentials, tokenPath, scope.`);
    });
    this.credentials = credentials;
    this.tokenPath = tokenPath;
    this.scope = scope;
  }
  auth (cb) {
    let { secret, clientID, redirects } = this.credentials;
    this.oAuth2Client = new google.auth.OAuth2(clientID, secret, redirects[0]);
    readFile(this.tokenPath, (err, token) => {
      if (err) return this.getNewToken(cb);
      let parsedToken = JSON.parse(token);
      this.oAuth2Client.setCredentials(parsedToken);
      cb(null, parsedToken, this.oAuth2Client);
    });
  }
  getNewToken (cb) {
    let authUrl = this.oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: this.scope });
    open(authUrl);
    let rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      this.oAuth2Client.getToken(code, (err, token) => {
        if (err) return cb(new Error(`Error retrieving access token: ${err}`));
        this.oAuth2Client.setCredentials(token);
        writeFile(this.tokenPath, JSON.stringify(token, null, 2), (err) => {
          if (err) return cb(err);
          console.warn('Token stored to', this.tokenPath);
        });
        cb(null, token, this.oAuth2Client);
      });
    });
  }
};
