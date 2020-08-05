
let express = require('express')
  , { join } = require('path')
  , compression = require('compression')
  , app = express()
;

app.use(compression());


app.use(express.static(join(__dirname, 'public')));
