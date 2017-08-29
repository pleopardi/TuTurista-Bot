/*
  Funzione per l'invio di specifiche tipologie di messaggio
*/

const axios = require('axios');

const PAGE_ACCESS_TOKEN = require('../config').PAGE_ACCESS_TOKEN;

function inviaLista(id_utente, coordinate_utente, luoghi) {
  const elementiLista = luoghi.map(luogo => {
    return ({
      title: luogo.nome,
      subtitle: luogo.indirizzo,
      image_url: luogo.immagine,
      buttons: [
        {
          type: 'web_url',
          url: `https://www.google.com/maps/dir/${coordinate_utente.lat},${coordinate_utente.lon}/${luogo.coordinate.lat},${luogo.coordinate.lon}`,
          title: 'Vai',
          webview_height_ratio: 'full',
        }
      ]
    });
  })

  return axios({
    url: `https://graph.facebook.com/v2.6/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: {
      recipient: {
        id: id_utente
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'list',
            top_element_style: 'compact',
            // Minimo due, massimo quattro elementi in questo template
            elements: elementiLista
          }
        }
      }
    }
  })
}

function messaggioTesto(id_utente, messaggio = 'Ciao') {
  return axios({
    url: `https://graph.facebook.com/v2.6/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: {
      recipient: {
        id: id_utente
      },
      message: {
        text: messaggio
      }
    }
  });
}

function richiediPosizione(id_utente) {
  return axios({
    url: `https://graph.facebook.com/v2.6/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: {
      recipient: {
        id: id_utente
      },
      message: {
        text: 'Inviami la tua posizione per procedere',
        quick_replies: [
          {
            content_type: 'location'
          }
        ]
      }
    }
  });
}

function selezionaTipo(id_utente) {
  return axios({
    url: `https://graph.facebook.com/v2.6/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: {
      recipient: {
        id: id_utente
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: 'Ciao, cosa devo cercare per te?',
            // Massimo tre bottoni in questo template
            buttons: [
              {
                type: 'postback',
                title: 'Parcheggio',
                payload: 'parking'
              },
              {
                type: 'postback',
                title: 'Negozi',
                payload: 'store'
              },
              {
                type: 'postback',
                title: 'Ristoranti',
                payload: 'restaurant'
              }
            ]
          }
        }
      }
    }
  });
}

module.exports = {
  inviaLista,
  messaggioTesto,
  richiediPosizione,
  selezionaTipo
};
