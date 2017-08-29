const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

const invioMessaggi = require('../services/invioMessaggi');
const risolviIndirizzo = require('../services/risolviIndirizzo');
const trovaPOI = require('../services/trovaPOI');

const VERIFY_TOKEN = require('../config').VERIFY_TOKEN;
// Store in memoria per gestire utenti con conversazioni in corso
const utenti = new Map();

module.exports = app => {
  /* Routes per Bot Messenger */

  // Per abilitazione integrazione webhook
  app.get('/webhook', (req, res) => {
    if (
      req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VERIFY_TOKEN
    ) {
      return res.send(req.query['hub.challenge']);
    }
    res.send('Unvalid verify token');
  });

  app.post('/webhook', (req, res) => {
    const data = req.body;

    // Accertati che la sorgente sia una pagina iscritta
    if (data.object === 'page') {
      // Itera su ogni elemento, un elemento = una pagina
      // Potrebbero esserci più pagine: iscrizioni multiple ed invio in batch
      data.entry.forEach(pageObj => {
        // Itera su ogni messaggio
        pageObj.messaging.forEach(msgEvent => {

          // Gestione messaggio
          // Postback: messaggio con risposta predefinita
          // Message: messaggio custom utente
          if(msgEvent.postback || msgEvent.message) {
            console.log('ID Utente:', msgEvent.sender.id);

            const id_utente = msgEvent.sender.id;

            // Se l'utente non è registrato in utenti, lo inserisco con chiave = id al primo step del flusso di conversazione
            if (!utenti.has(id_utente)) {
              utenti.set(id_utente, {
                step: 0,
                tipo: '', //parking | store | restaurant
                coordinate: {} //{ lat: , lon: }
              });
            }

            // Prelevo oggetto utente
            const utente = utenti.get(id_utente);

            switch(utente.step) {
              case 0:
                // Invio tipologie punti di interesse selezionabili
                invioMessaggi.selezionaTipo(id_utente).then(() => {
                  utente.step = 1;
                  utenti.set(id_utente, utente);
                }).catch(() => {
                  invioMessaggi.messaggioTesto(id_utente, 'Servizio non disponibile. Riprova fra poco.').then(() => {
                    utenti.delete(id_utente);
                  });
                });
                break;
              case 1:
                // Ricevo tipologia punti di interesse e richiedo posizione
                if(msgEvent.postback) {
                  const tipo = msgEvent.postback.payload || '';
                  if(tipo && tipo.match(/parking|store|restaurant/)) {
                    utente.tipo = tipo;
                    utenti.set(id_utente, utente);

                    invioMessaggi.richiediPosizione(id_utente).then(() => {
                      utente.step = 2;
                      utenti.set(id_utente, utente);
                    }).catch(() => {
                      invioMessaggi.messaggioTesto(id_utente, 'Servizio non disponibile. Riprova fra poco.').then(() => {
                        utenti.delete(id_utente);
                      });
                    });
                  } else {
                    // In teoria qui non si dovrebbe mai entrare, ma per sicurezza...
                    invioMessaggi.selezionaTipo(id_utente);
                  }
                } else {
                  invioMessaggi.selezionaTipo(id_utente);
                }
                break;
              case 2:
                if(msgEvent.message && msgEvent.message.attachments) {

                  const lat = msgEvent.message.attachments[0].payload.coordinates.lat ? msgEvent.message.attachments[0].payload.coordinates.lat.toString() : '';
                  const lon = msgEvent.message.attachments[0].payload.coordinates.long ? msgEvent.message.attachments[0].payload.coordinates.long.toString() : '';

                  // Procedi solo se le coordinate sono utilizzabili
                  if(lat && lon && lat.match(/\d+\.\d+/) && lon.match(/\d+\.\d+/)) {
                    utente.coordinate = { lat, lon };
                    utenti.set(id_utente, utente);

                    trovaPOI(utente.coordinate, utente.tipo).then(luoghi => {
                      // Se c'è un solo luogo come risultato, non posso usare la lista. Da sistemare.
                      if(luoghi && luoghi.length > 1) {
                        invioMessaggi.inviaLista(id_utente, utente.coordinate, luoghi).then(() => {
                          setTimeoutPromise(700).then(() => {
                            invioMessaggi.messaggioTesto(id_utente, 'Scrivi qualunque cosa per avviare una nuova ricerca.');
                            utenti.delete(id_utente);
                          });
                        });
                      } else {
                        invioMessaggi.messaggioTesto(id_utente, `Non sono riuscito a trovare risultati entro 5 km da te.`).then(() => {
                          setTimeoutPromise(500).then(() => {
                            invioMessaggi.messaggioTesto(id_utente, 'Scrivimi per avviare una nuova ricerca.');
                            utenti.delete(id_utente);
                          });
                        });
                      }
                    }).catch(() => {
                      invioMessaggi.messaggioTesto(id_utente, 'Servizio non disponibile. Riprova fra poco.').then(() => {
                        utenti.delete(id_utente);
                      });
                    });
                  } else {
                    invioMessaggi.richiediPosizione(id_utente);
                  }
                } else {
                  invioMessaggi.richiediPosizione(id_utente);
                }
            }

          }
        });
      });
      res.sendStatus(200);
    }
  });

  /* Routes per Test Bot in Locale */
  app.get('/', (req, res) => {
    const risposta = 'Benvenuto in TuTurista';
    res.send(risposta);
  });

  app.post('/', (req, res) => {
    // Verifico che sia la richiesta di un utente
    if (req.body.id) {
      const { id: id_utente } = req.body; // Destrutturazione + rinomina
      // Se l'utente non è registrato in utenti, lo inserisco con chiave = id al primo step
      if (!utenti.has(id_utente)) {
        utenti.set(id_utente, {
          step: 0,
          tipo: '', //parking | store | restaurant | church
          coordinate: {} //{ lat: , lot: }
        });
      }

      const utente = utenti.get(id_utente);
      switch (utente.step) {
        case 0:
          // Do il benvenuto
          // Illustro tipologia punti di interesse selezionabili
          utente.step = 1;
          utenti.set(id_utente, utente);
          res.send(utente);
          break;
        case 1:
          // Ricevo tipologia punto di interesse
          utente.tipo = req.body.tipo;
          // Chiedo coordinate o indirizzo
          utente.step = 2;
          utenti.set(id_utente, utente);
          res.send(utente);
          break;
        case 2: {
          // {} Confinano indirizzo a case, invece che scope = intero switch
          // Risolvo indirizzo se necessario
          // Fornisco risultati ricerca
          const { indirizzo } = req.body;
          risolviIndirizzo(indirizzo).then(coordinate => {
            if (coordinate) {
              utente.coordinate.lat = coordinate.lat;
              utente.coordinate.lon = coordinate.lon;
              utente.step = 0;
            }

            trovaPOI(utente.coordinate, utente.tipo).then(luoghi => {
              res.send({ utente, luoghi });

              utente.step = 0;
              utente.tipo = '';
              utente.coordinate = {};
            });
          });

          break;
        }
        default:
          utente.step = 0;
          utente.tipo = '';
          utente.coordinate = {};
      }
    }
  });
};
