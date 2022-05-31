// shapes api server

const { debug } = require('./utils');
//const base64url = require('base64url');


const decodeB64urlUtf8 = (b64urlDataString) => {
  // old form - will need require above
  //base64url.decode(b64urlDataString);
  try {
    const dataBuf = Buffer.from(b64urlDataString, 'base64url');
    const dataString = dataBuf.toString();
    debug(`succeeded base64url decode: ${dataString}`)
    return { valid: true, status: 'decoded base64url data', data: dataString };
  } catch (error) {
    debug(`failed base64url decode: ${b64urlDataString}: ${error}`)
    return { valid: false, status: `failed base64url decode` };
  }
}

const encodeB64urlUtf8 = (dataString) => {
  const dataBuff = Buffer.from(dataString);
  const b64urlDataString = dataBuff.toString('base64url');
  debug(`succeeded base64url encode: ${dataString} -> ${b64urlDataString}`)
  return { valid: true, status: `succeeded base64url encode`, data: b64urlDataString };
  // old form - will need require above and be *something like*
  //base64url.encode(b64urlDataString);
}

const decodeJsonB64urlUtf8 = (b64urlDataString) => {
  const decodeResult = decodeB64urlUtf8(b64urlDataString);
  if (!decodeResult.valid) {
    return decodeResult;
  }
  try {
    const jsonDataString = decodeResult.data
    const decodedData = JSON.parse(jsonDataString);
    debug(`succeeded JSON decode`)
    return { valid: true, status: `decoded JSON data`, data: decodedData, jsonData: jsonDataString};
  } catch (error) {
    debug(`failed JSON decode`)
    return { valid: false, status: `failed JSON decode` };
  }
}

const encodeJsonB64urlUtf8 = (data) => {
  const jsonDataString = JSON.stringify(data)
  return encodeB64urlUtf8(jsonDataString)
}

const decodeObjectFromListOfListsJsonUtf8B64url = (b64urlDataString) => {
  const decodedResult = decodeJsonB64urlUtf8(b64urlDataString);
  if (!decodedResult.valid) {
    return decodedResult;
  }

  const decodedData = decodedResult.data
  if (typeof decodedData !== 'object' || !decodedData.length) {
    debug('failed outer list conversion, empty list')
    return { valid: false, status: `failed outer list conversion, empty list` };
  }

  const keys = [];
  const resultData = {};
  for (const [key, val] of decodedData) {
    if (!typeof key === 'string' || !typeof val === 'string' || key === '' ) {
      debug(`failed inner list conversion after ${keys.length} elements: key/value check`)
      return { valid: false, status: `failed inner list conversion: key/value check` };
    }
    if (resultData.hasOwnProperty(key)) {
      debug(`failed inner list conversion after ${keys.length} elements: duplicate property ${key}`)
      return { valid: false, status: 'failed inner list conversion: duplicate property' };
    }
    keys.push(key);
    resultData[key] = val;
  }
  return { valid: true, status: `succeeded list of lists conversion`, data: resultData, keys: keys, jsonData: decodedResult.jsonData };
}

const encodeListOfListsJsonUtf8B64urlFromObject = (data, keys) => {
  const headerList = [];
  for (const key of keys) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      if (typeof value === 'string' && value !== '') {
        headerList.push([key, value]);
      }
    }
  }
  return encodeJsonB64urlUtf8(headerList)
}

module.exports = { decodeObjectFromListOfListsJsonUtf8B64url, encodeListOfListsJsonUtf8B64urlFromObject };

// end of file
