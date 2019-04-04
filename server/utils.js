// shapes api server utilities

require('dotenv').config();

const LOG = (process.env.SERVER_LOGGING || 'true') == 'true';

// debugging

const debug = LOG ?
  (msg) => console.log('      ' + msg) :
  (msg) => {};

module.exports = { debug };

// end of file
