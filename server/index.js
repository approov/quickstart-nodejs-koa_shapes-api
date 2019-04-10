// shapes api server

const env = require('dotenv');
env.config({path: '.env'})
env.config({path: '.env.default'});

const { debug } = require('./utils');
const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const { default: sslify, xForwardedProtoResolver: xfpResolver } = require('koa-sslify');
const fs = require('fs');
const http = require('http');
const https = require('https');

const v0Router = require('./v0-routes');
const v1Router = require('./v1-routes');
const v2Router = require('./v2-routes');

const HTTP_PORT = process.env.HTTP_PORT || 80;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;
const ENFORCE_HTTPS=(process.env.ENFORCE_HTTPS || 'true').toLowerCase() === 'true';
const HTTPS_MODE=(process.env.HTTPS_MODE || 'direct').toLowerCase();
const HTTPS_KEY=Buffer.from(process.env.HTTPS_KEY || '', 'base64');
const HTTPS_CRT=Buffer.from(process.env.HTTPS_CRT || '', 'base64');
const LOG = (process.env.ENABLE_LOGGING || 'true').toLowerCase() === 'true';
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

// handle default route

const invite = `<!DOCTYPE html>
  <html><body>
    <h1>Approov Mobile App Authentication</h1>
    <P>To learn more about how Approov protects your APIs from
    malicious bots and tampered or fake apps, see
    <a href="https://approov.io/docs">https://approov.io/docs</a>.</p>
  </body></html>`;

const router = new Router();

router.get('/', async ctx => {
  debug(`text: ${invite}`);
  ctx.type = 'html';
  ctx.body = invite;
});

app.use(router.routes());
app.use(router.allowedMethods());

// handle v0 original routes

app.use(v0Router.routes());
app.use(v0Router.allowedMethods());

// handle v1 unprotected routes

app.use(v1Router.routes());
app.use(v1Router.allowedMethods());

// handle v2 protected routes

app.use(v2Router.routes());
app.use(v2Router.allowedMethods());

// start service

let httpServer, httpsServer;

if (HTTPS_MODE == 'direct') {
  if (ENFORCE_HTTPS) {
    app.use(sslify({
      port: HTTPS_PORT
    }));
  }

  httpServer = http.createServer(app.callback())
  .listen({ port: HTTP_PORT}, () => {
    console.log(`Listening on http port ${HTTP_PORT}...`);
  })
  .on('error', err => {
    console.error(`error: ${err}`);
  });

  httpsServer = https.createServer({key: HTTPS_KEY, cert: HTTPS_CRT}, app.callback())
  .listen({ port: HTTPS_PORT}, () => {
    console.log(`Listening on http ports ${HTTPS_PORT}...`);
  })
  .on('error', err => {
    console.error(`error: ${err}`);
  });
} else if (HTTPS_MODE == 'x-forwarded-proto') {
  if (ENFORCE_HTTPS) {
    app.use(sslify({
      resolver: xfpResolver
    }));
  }

  httpServer = http.createServer(app.callback())
  .listen({ port: HTTP_PORT}, () => {
    console.log(`Listening on http port ${HTTP_PORT}...`);
  })
  .on('error', err => {
    console.error(`error: ${err}`);
  });
} else {
  console.error(`ERROR: HTTPS_MODE \'${HTTPS_MODE}\' not recognized`);
}

// export service close function
module.exports = {
  httpServer,
  httpsServer
}

// end of file
