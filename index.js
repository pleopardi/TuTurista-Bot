'use strict';

const express = require('express');
const bodyParser = require('body-parser');

// const lineaComando = require('./services/lineaComando');

const app = express();

app.use(bodyParser.json());

require('./routes')(app);

// Subscribe webhook a pagina Facebook
require('./services/subscribeWebhook');

app.listen(process.env.PORT || 3000, () => {
  console.log("Server online su porta 3000");
})
