// shapes api server

require('dotenv').config();
const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const PORT = process.env.SERVER_PORT || 8081;
const LOG = (process.env.SERVER_LOGGING || 'true') == 'true';
const AUTH_ENFORCE = (process.env.AUTH_ENFORCEMENT || 'true') == 'true';
const APPROOV_SECRET = Buffer.from(fs.readFileSync(process.env.APPROOV_SECRET), 'base64');
const app = new Koa();
const router = new Router();

// handle debug logging

const debug = LOG ?
  (msg) => console.log('      ' + msg) :
  (msg) => {};
if (LOG) app.use(logger());

// handle errors

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
});

// handle authentication

const approovTokenHeader = 'approov-token';
const approovTagHeader = 'approov-tag';

router.use(['/shapes', '/forms'], async (ctx, next) => {
  debug('check Approov token');

  let status = '';

  const approovToken = ctx.headers[approovTokenHeader];
  debug(`approov-token: ${approovToken}`);
  if (!approovToken) {
    status = 'missing approov token';
  } else { 
    try {
      var payload = jwt.verify(approovToken, APPROOV_SECRET, {algorithms: ['HS256']});
    } catch(err) {
      status = 'invalid approov token';
    }
    if (!status && ctx.path == '/forms') {
      debug('check Approov tag');
      const payClaim = payload['pay'];
      if (payClaim) {
        debug(`approov-tag: claim ${payClaim}`);
        const approovTag = ctx.headers[approovTagHeader];
        if (!approovTag) {
          status = 'missing Approov tag';
        } else {
          const tagHash = crypto.createHash('sha256').update(approovTag).digest('base64');
          if (tagHash != payClaim) {
            status = 'mismatched Approov tag';
          }
        }
      } else {
        debug('missing pay claim in Approov; tag comparison skipped');
      }
    }
  }

  if (status) {
    if (AUTH_ENFORCE) {
      debug(`authorization failed: ${status} - error`);
      ctx.throw(400, 'Bad Request');
    } else {
      debug(`authorization failed: ${status} - warning only`);
    }
  } else {
    debug('authorization passed');
  }

  await next();
});

// handle routes

const hello = 'Hello, World!';

router.get('/hello', async ctx => {
  debug(`text: ${hello}`);
  ctx.body = {
    text: hello
  };
});

const shapes = [ 'Circle', 'Rectangle', 'Square', 'Triangle' ];

router.get('/shapes', async ctx => {
  const shape = shapes[Math.floor((Math.random() * shapes.length))];
  debug(`shape: ${shape}`);
  ctx.body = {
    shape
  };
});

const forms = [ 'Box', 'Cone', 'Cube', 'Sphere' ];

router.get('/forms', async ctx => {
  const form = forms[Math.floor((Math.random() * forms.length))];
  debug(`form: ${form}`);
  ctx.body = {
    form
  };
});

app.use(router.routes());

// start server

const http = require('http');
const options = {
};

// const http = require('https');
// const options = {
//   key: fs.readFileSync('./vault/xxx.key'),
//   cert: fs.readFileSync('./vault/xxx.crt')
// };

const server = http.createServer(options, app.callback()).listen(PORT).on('error', err => {
   console.error(err);
 });

module.exports = server;

// end of file
