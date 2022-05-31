// shapes api server

const { debug } = require('./utils');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { registerDeviceWithValue, getDeviceValue, resetDeviceValue } = require('./device-register');
const { decodeObjectFromListOfListsJsonUtf8B64url: decodePayload, encodeListOfListsJsonUtf8B64urlFromObject: encodePayload } = require('./custom-payload')

const APPROOV_SECRET=Buffer.from(process.env.APPROOV_SECRET || '', 'base64');
const ALLOW_DEBUG_TOKENS = process.env.ALLOW_DEBUG_TOKENS === 'true';

const approovTokenHeader = 'Approov-Token'.toLowerCase();
const authenticationHeader = 'Authorization'.toLowerCase();

const verifyToken = (ctx, payClaimData) => {
  debug('>>> Check Approov token <<<');

  const approovToken = ctx.headers[approovTokenHeader];
  if (!approovToken) {
    return { valid: false, status: 'missing approov token' };
  }
  debug(`approov-token: ${approovToken}`);
  debug(`ALLOW_DEBUG_TOKENS: ${process.env.ALLOW_DEBUG_TOKENS} - ${ALLOW_DEBUG_TOKENS}`)
  let claims = null;
  if (ALLOW_DEBUG_TOKENS && approovToken.startsWith('{')) {
    // permit dummy approov token which is just the JSON claims string
    try {
      claims = JSON.parse(approovToken);
      debug(`succeeded dummy approov token JSON decode: ${approovToken}`)
    } catch (error) {
      debug(`failed dummy approov token JSON decode: ${approovToken}, ${error}`);
      return { valid: false, status: 'failed dummy approov token JSON decode' };
    }
  } else {
    try {
      claims = jwt.verify(approovToken, APPROOV_SECRET, {algorithms: ['HS256']});
    } catch(err) {
      return { valid: false, status: 'invalid approov token' };
    }
  }
  // If the payClaimData is truthy, then check the pay claim of the token
  // against the hash of the payClaimData
  if (payClaimData) {
    debug('>>> Check Approov token binding <<<');
    const payClaimValue = claims['pay'];
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
  return { valid: true, status: 'valid approov token', token: approovToken, claims: claims };
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

const processPayloadResults = (keys, data, lastDeviceResult) => {
  const deviceResult = {pass: true};
  const responseData = {id:data.id};
  for (const [idx, checker] of [].entries()) {
    if (!checker(data, responseData)) {
      debug('checker@${idx} caused failure');
      deviceResult.pass = false;
    }
  }
  const encodedResponseResult = encodePayload(responseData, keys);
  if (!encodedResponseResult.valid) {
    debug('failed response payload encoding: ' + encodedResponseResult.status);
    deviceResult.pass = false;
    return [ deviceResult, '' ];  
  }

  return [ deviceResult, encodedResponseResult.data ];
}

const CUSTOM_PAYLOAD_HEADER = 'Pay-Content'.toLowerCase();
const CUSTOM_PAYLOAD_RESPONSE_HEADER = 'Pay-Response'.toLowerCase();
const verifyCustomPayloadWithToken = (ctx, registerNewDevice) => {
  var payloadResult, tokenResult;
  // read the payload if one is present
  const b64urlData = ctx.headers[CUSTOM_PAYLOAD_HEADER];
  if (b64urlData) {
    // decode payload
    var payloadResult = decodePayload(b64urlData);
    // { valid: true|false, status: <msg>, data: resultData, keys: keys, jsonData: decodedResult.jsonData };
    if (!payloadResult.valid) {
      return { valid: false, status: 'device fail; invalid data in payload header' };
    }
    tokenResult = verifyToken(ctx, payloadResult.jsonData)
    // return { valid: true, status: 'valid approov token', token: approovToken, claims: claims };
  } else {
    tokenResult = verifyToken(ctx)
  }
  // check for a valid token
  if (!tokenResult.valid) {
    return tokenResult;
  }
  // check for register new device flag and set it up with at least the current token
  if (registerNewDevice) {
    registerDeviceWithValue(tokenResult.claims.did, {pass: true, token: tokenResult.token})
  }
  // Retrieve the registered device properties
  const deviceResult = getDeviceValue(tokenResult.claims.did);
  if (!deviceResult) {
    return { valid: false, status: 'device fail; not registered' };
  }

  // now check the rest of the payload properties if they are present
  if (payloadResult) {
    const [newDeviceResult, payloadResponse] = processPayloadResults(payloadResult.keys, payloadResult.data, deviceResult)
    // add the raw token to the result for future matching
    newDeviceResult.token = tokenResult.token;
    resetDeviceValue(tokenResult.claims.did, newDeviceResult);
    // add the response header to the generated value whether or not the
    // payload result check was successful
    ctx.set(CUSTOM_PAYLOAD_RESPONSE_HEADER, payloadResponse)
    const result = {response: payloadResponse};
    if (newDeviceResult.pass) {
      result.valid = true;
      result.status = 'device pass; updated payload properties';
    } else {
      result.valid = false;
      result.status = 'device fail; updated token';
    }
    return result;
  }
  // no payload result, just check that the device is registered with a passing result
  if (!deviceResult.pass) {
    return { valid: false, status: 'device fail; cached payload check fail' };
  }
  if (deviceResult.token !== tokenResult['token']) {
    return { valid: false, status: 'device fail; unknown token' };
  }
  return {valid: true, status: 'device pass; matching token'};
}

module.exports = { verifyToken, verifyApproovAuthTokenBinding, verifyCustomPayloadWithToken };

// end of file
