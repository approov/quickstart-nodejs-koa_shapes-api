// shapes api server

const { debug } = require('./utils');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const APPROOV_SECRET=Buffer.from(process.env.APPROOV_SECRET || '', 'base64');
const approovTokenHeader = 'approov-token';
const approovTagHeader = 'approov-tag';
const authenticationHeader = 'authentication'

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

const verifyTaggedToken = (ctx) => {
  debug('check Approov tagged token');

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
    debug('missing pay claim in Approov; tag comparison ignored');
    return { valid: true, status: 'valid approov token' };
  }

  debug(`approov-tag: claim ${payClaim}`);
  let approovTag = ctx.headers[approovTagHeader];
  if (!approovTag) {
    approovTag = ctx.headers[authenticationHeader];
    if (!approovTag) {
      return { valid: false, status: 'missing approov tag' };
    }
    const split = approovTag.split(/\s(.+)/);
    if (split.length < 2 || split[0].toLowerCase() !== 'bearer') {
      return { valid: false, status: 'invalid bearer auth' };
    }
    approovTag = split[1];
  }
  const tagHash = crypto.createHash('sha256').update(approovTag).digest('base64');
  if (tagHash != payClaim) {
    return { valid: false, status: 'invalid approov tag' };
  }
  return { valid: true, status: 'valid approov tagged token' };
}

module.exports = { verifyToken, verifyTaggedToken };

// end of file
