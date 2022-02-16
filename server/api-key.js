const { debug } = require('./utils');

const API_KEY=process.env.API_KEY || '';

const verifyApiKey = (ctx) => {
  debug('>>> Check API Key <<<');

  const apiKey = ctx.headers['api-key'];
  debug(`API KEY HEADER: ${apiKey}`);

  if (!apiKey) {
    return { valid: false, status: 'missing the api key in the request' };
  }

  if (apiKey === API_KEY) {
    return { valid: true, status: 'valid api key' };
  }

  return { valid: false, status: 'invalid api key' };
}

module.exports = { verifyApiKey };
