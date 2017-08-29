/*
  Funzione per l'estrazione dei punti di interesse del tipo selezionato dalla
  API di Google Places

  Esempio
  https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=43.1588734,13.7200884&radius=500&type=restaurant&language=it&key=AIzaSyCFdjSb1LN8KdVVCWVPHqhCiCnVoY2SfAg
  radius: metri, <= 50.000
*/

const axios = require('axios');

const API_KEY = require('../config').GOOGLE_PLACES_API_KEY;

const RADIUS = 5000;
const URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=';

async function trovaPOI(coordinate, tipo) {
  const { lat, lon } = coordinate;
  const url_completo = `${URL}${lat},${lon}&radius=${RADIUS}&type=${tipo}&language=it&key=${API_KEY}`;

  const { status, data } = await axios.get(url_completo);
  if ((status === 200) && (data.results.length > 0)) {
    // risultati: primi 4 risultati con tutti i campi disponibili in google
    const risultati = data.results.slice(0, 4);
    // luoghi: primi 10 risultati con campi selezionati
    const luoghi = risultati.map(luogo => {
      return ({
        coordinate: {
          lat: luogo.geometry.location.lat,
          lon: luogo.geometry.location.lng
        },
        immagine: luogo.icon || '',
        indirizzo: luogo.vicinity || '',
        nome: luogo.name || 'Assente',
        voto: luogo.rating || '-'
      })
    });
    return luoghi;
  }
  return null;
}

module.exports = trovaPOI;
