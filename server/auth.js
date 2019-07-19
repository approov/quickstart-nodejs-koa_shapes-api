// shapes api server

const { debug } = require('./utils');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const APPROOV_SECRET=Buffer.from(process.env.APPROOV_SECRET || '', 'base64');
const approovTokenHeader = 'Approov-Token'.toLowerCase();
const authenticationHeader = 'Authorization'.toLowerCase();

const verifyToken = (ctx) => {
  debug('check Approov token');

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
  return { valid: true, status: 'valid approov token' };
}

const verifyBoundToken = (ctx) => {
  debug('check Approov bound token');

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

  const payClaim = payload['pay'];
  if (!payClaim) {
    debug('missing pay claim in Approov; binding comparison ignored');
    return { valid: true, status: 'valid approov token' };
  }

  debug(`approov-claim: claim ${payClaim}`);
  const authString = ctx.headers[authenticationHeader];
  if (!authString) {
    return { valid: false, status: 'missing bearer authentication' };
  }
  const split = authString.split(/\s(.+)/);
  if (split.length < 2 || split[0].toLowerCase() !== 'bearer') {
    return { valid: false, status: 'invalid bearer authentication' };
  }
  const authData = split[1];

  const authHash = crypto.createHash('sha256').update(authData).digest('base64');
  if (payClaim !== authHash) {
    return { valid: false, status: 'invalid approov bound token' };
  }
  return { valid: true, status: 'valid approov bound token' };
}

module.exports = { verifyToken, verifyBoundToken };

// end of file
