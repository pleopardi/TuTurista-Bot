const axios = require('axios');

const PAGE_ACCESS_TOKEN = require('../config').PAGE_ACCESS_TOKEN;

// Richiesta per settare pulsante iniziale
axios({
  url: `https://graph.facebook.com/v2.6/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
  method: 'post',
  headers: { 'Content-Type': 'application/json' },
  data: {
    get_started: {
      payload: 'Inizia'
    }
  }
}).then(({ status, data }) => {
  if (status === 200 && data.result === 'success') {
    return console.log('Pulsante "Inizia" Settato con Successo');
  }
  console.log('Errore nel Settare Pulsante "Inizia"');
});
