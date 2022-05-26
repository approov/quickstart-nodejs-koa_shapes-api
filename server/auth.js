// shapes api server

const { debug } = require('./utils');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const APPROOV_SECRET=Buffer.from(process.env.APPROOV_SECRET || '', 'base64');
const approovTokenHeader = 'Approov-Token'.toLowerCase();
const authenticationHeader = 'Authorization'.toLowerCase();

const verifyToken = (ctx, payClaimData) => {
  debug('>>> Check Approov token <<<');

  const approovToken = ctx.headers[approovTokenHeader];
  debug(`approov-token: ${approovToken}`);
  if (!approovToken) {
    return { valid: false, status: 'missing approov token' };
  }
  try {
    var payload = jwt.verify(approovToken, APPROOV_SECRET, {algorithms: ['HS256']});
  } catch(err) {
    return { valid: false, status: 'invalid approov token' };
  }

  // If the payClaimData is truthy, then check the pay claim of the token
  // against the hash of the payClaimData
  if (payClaimData) {
    debug('>>> Check Approov token binding <<<');
    const payClaimValue = result.payload['pay'];
    if (!payClaimValue) {
      debug('missing pay claim in Approov; binding comparison ignored');
      return { valid: false, status: 'approov token has no pay claim' };
    }

    const payClaimDataHash = crypto.createHash('sha256').update(payClaimData).digest('base64');
    if (payClaimValue !== payClaimDataHash) {
      debug(`approov-pay-claim mismatch: claim ${payClaimValue} != data hash ${payClaimDataHash}`);
      return { valid: false, status: 'approov token pay claim mismatch' };
    }
  }
  return { valid: true, status: 'valid approov token', payload: payload };
}

const verifyApproovAuthTokenBinding = (ctx) => {
  debug('>>> Check Approov Auth Token Binding');

  const authString = ctx.headers[authenticationHeader];
  if (!authString) {
    return { valid: false, status: 'missing bearer authentication' };
  }
  const split = authString.split(/\s(.+)/);
  if (split.length < 2 || split[0].toLowerCase() !== 'bearer') {
    return { valid: false, status: 'invalid bearer authentication' };
  }
  const authData = split[1];

  return verifyToken(ctx, authData);
}

module.exports = { verifyToken, verifyApproovAuthTokenBinding };

// end of file
