// shapes api server

const { debug } = require('./utils');
//const base64url = require('base64url');


const payloadHeader = 'Pay-Content'.toLowerCase();
const responseHeader = 'Pay-Response';

const getUtf8B64url = (ctx, headerName) => {
  const b64urlData = ctx.headers[headerName];
  if (!b64urlData) {
    return { valid: false, status: `no data in header: ${headerName}` };
  }

  // old form - will need require above
  //base64url.decode(b64urlData);
  try {
    const dataBuf = Buffer.from(b64urlData, 'base64url');
    return { valid: true, status: `decoded base64url from header: ${headerName}`, data: dataBuf.toString() };
  } catch (error) {
    debug(`failed base64url decode: ${headerName} -> ${b64urlData}`)
    return { valid: false, status: `failed base64url decode: ${headerName} - ${error}` };
  }
}

const getJSONDecodeUtf8B64url = (ctx, headerName) => {
  const headerResult = getUtf8B64url(ctx, headerName);
  if (!headerResult.valid) {
    return headerResult;
  }
  try {
    const jsonData = headerResult.data
    const decodedData = JSON.parse(jsonData);
    return { valid: true, status: `decoded JSON from header: ${headerName}`, data: decodedData, jsonData: jsonData};
  } catch (error) {
    debug(`failed JSON decode: ${headerName} -> ${jsonData}`)
    return { valid: false, status: `failed JSON decode: ${headerName} - ${error}` };
  }
}

const getObjectFromListOfListsHeader = (ctx, headerName) => {
  const decodedResult = getJSONDecodeUtf8B64url(ctx, headerName);
  if (!decodedResult.valid) {
    return decodedResult;
  }

  const decodedData = decodedResult.data
  if (typeof decodedData !== 'object' || !decodedData.length) {
    debug(`failed outer List conversion, empty list: ${headerName} -> ${decodedResult.jsonData}`)
    return { valid: false, status: `failed outer List conversion: ${headerName}` };
  }

  const keys = [];
  const resultData = {};
  for (const [key, val] of decodedData) {
    if (!typeof key === 'string' || !typeof val === 'string' || key === "" ) {
      debug(`failed inner List conversion, after ${keys.length} elements: ${headerName} -> ${decodedResult.jsonData}`)
      return { valid: false, status: `failed inner List conversion, key/value check: ${headerName}` };
    }
    if (resultData.hasOwnProperty(key)) {
      debug(`inner List conversion found duplicate property, after ${keys.length} elements: ${headerName} -> ${decodedResult.jsonData}`)
      return { valid: false, status: `failed inner List conversion, duplicate property: ${headerName}` };
    }
    keys.push(key);
    resultData[key] = val;
  }
  return { valid: true, status: `decoded special object from header: ${headerName}`, data: resultData, keys: keys, jsonData: decodedResult.jsonData };
}

module.exports = { getObjectFromListOfListsHeader };

// end of file
