// shapes api server

const { debug } = require('./utils');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { verifyToken, verifyApproovAuthTokenBinding } = require('./auth');

const payloadHeader = 'Pay-Content'.toLowerCase();
const responseHeader = 'Pay-Response';

const deviceRegister = {};

const registerDevice = (deviceID, value) => {

}

module.exports = { verifyToken, verifyApproovAuthTokenBinding };

// end of file
