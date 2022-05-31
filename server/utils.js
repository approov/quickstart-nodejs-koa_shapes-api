// shapes api server utilities

const LOG = (process.env.ENABLE_LOGGING || 'true') === 'true';

// debugging

const debug = LOG ?
  (msg) => console.log('      ' + msg) :
  (msg) => {};

// const debug = (msg) => console.log('      ' + msg);

module.exports = { debug };

// end of file
