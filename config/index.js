if (process.env.NODE_ENV === 'production') {
  module.exports = {
    PAGE_ACCESS_TOKEN: process.env.PAGE_ACCESS_TOKEN,
    VERIFY_TOKEN: process.env.VERIFY_TOKEN,
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY
  }
} else {
  module.exports = require('./development.json');
}
