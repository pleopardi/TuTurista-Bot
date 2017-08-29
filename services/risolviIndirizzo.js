/*
  Funzione che sfrutta le API di Google per risolvere il nome di un luogo in una
  coppia di coordinate latitudine, longitudine
*/

const axios = require('axios');

const URL = 'https://maps.googleapis.com/maps/api/geocode/json?address=';

async function risolviIndirizzo(luogo){

  const url_completo = `${URL}${luogo}`;

  const { status, data } = await axios.get(url_completo);
  //console.log('status', status);
  //console.log('data', data);
  if ((status === 200) && (data.results.length > 0)) {
    const coordinate = {
      lat: data.results[0].geometry.location.lat,
      lon: data.results[0].geometry.location.lng,
    };
    return coordinate;
  }
  return {};
}

module.exports = risolviIndirizzo;
