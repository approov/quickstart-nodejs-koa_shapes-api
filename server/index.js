// shapes api server

require('dotenv').config();

const { debug } = require('./utils');
const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const https = require('http');

const v0Router = require('./v0-routes');
const v1Router = require('./v1-routes');
const u2Router = require('./u2-routes');
const v2Router = require('./v2-routes');

const PORT = process.env.SERVER_PORT || 8081;
const LOG = (process.env.SERVER_LOGGING || 'true') == 'true';
const app = new Koa();

// handle logging

if (LOG) app.use(logger());

// handle errors

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      status: err.message
    }
    ctx.app.emit('error', err, ctx);
  }
});

// handle v0 routes

app.use(v0Router.routes());
app.use(v0Router.allowedMethods());

// handle v1 routes

app.use(v1Router.routes());
app.use(v1Router.allowedMethods());

// handle u2 (v2 unprotected) routes

app.use(u2Router.routes());
app.use(u2Router.allowedMethods());

// handle v2 protected routes

app.use(v2Router.routes());
app.use(v2Router.allowedMethods());

// start server

const options = {
  //key: fs.readFileSync('./vault/xxx.key'),
  //cert: fs.readFileSync('./vault/xxx.crt')
};

const server = https.createServer(options, app.callback())
    .listen({ port: PORT}, () => {
      console.log(`Listening on port ${PORT}...`);
    })
    .on('error', err => {
      console.error(`error: ${err}`);
    });

module.exports = server;

// end of file
