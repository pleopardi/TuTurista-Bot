/*
  Modulo per subscribe automatico webhook a pagina Facebook
*/
const axios = require('axios');

const PAGE_ACCESS_TOKEN = require('../config').PAGE_ACCESS_TOKEN;

axios.post(`https://graph.facebook.com/v2.10/me/subscribed_apps?access_token=${PAGE_ACCESS_TOKEN}`)
  .then(({status, data}) => {
    if(status === 200 && data.success) {
      console.log('Iscrizione webhook alla pagina effettuato con successo');
    } else {
      console.log('Fallita iscrizione webhook alla pagina');
    }
  });
