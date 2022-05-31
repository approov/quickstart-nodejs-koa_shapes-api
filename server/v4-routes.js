const { debug } = require('./utils');
const Router = require('koa-router');
const { verifyApiKey } = require('./api-key');
const { verifyToken, verifyApproovAuthTokenBinding, verifyCustomPayloadWithToken } = require('./auth');

const ENFORCE_APPROOV = (process.env.ENFORCE_APPROOV || 'true') == 'true';

// approov token checks and custom payload handling

const abortOnInvalidApiKey = (ctx) => {
  const { valid, status } = verifyApiKey(ctx);

  if (!valid) {
    debug(`api key validation failed: ${status} - error`);
    ctx.throw(400, status);
  }

  debug(`api key is valid`);
}

const CUSTOM_PAYLOAD_RESPONSE_HEADER = 'Pay-Response'.toLowerCase();
const abortOnInvalidApproovToken = (ctx, result) => {
  if (result.hasOwnProperty('response') && typeof result.response === 'string' && result.response) {
    ctx.set(CUSTOM_PAYLOAD_RESPONSE_HEADER, result.response)
  }
  if (!result.valid) {
    if (ENFORCE_APPROOV) {
      debug(`authorization failed: ${result.status} - error`);
      ctx.throw(400, result.status);
    } else {
      debug(`authorization failed: ${result.status} - warning only`);
    }
  } else {
    debug('authorization passed');
  }
}

// handle routes

const router = new Router({
  prefix: '/v4'
});

// authorize routes

router.use('/shapes', async (ctx, next) => {
  // custom payload approov token check (no device registration)
  const result = verifyCustomPayloadWithToken(ctx, false);

  abortOnInvalidApproovToken(ctx, result);

  abortOnInvalidApiKey(ctx);

  await next();
});

// handle authorized routes

router.post('/register', async ctx => {
  // process the approov token as usual but also register the device if it's valid
  const result = verifyCustomPayloadWithToken(ctx, true);

  abortOnInvalidApproovToken(ctx, result);

  abortOnInvalidApiKey(ctx);

  debug(`register: success`);
  ctx.body = {
    status: 'success'
  };
});

const hello = 'Hello, World!';

router.get('/hello', async ctx => {
  debug(`text: ${hello}`);
  ctx.body = {
    text: hello,
    status: `${hello} (healthy)`
  };
});

const shapes = [ 'Circle', 'Rectangle', 'Square', 'Triangle' ];

router.get('/shapes', async ctx => {
  const shape = shapes[Math.floor((Math.random() * shapes.length))];
  debug(`shape: ${shape}`);
  ctx.body = {
    shape,
    status: `${shape} (approoved and api key valid)`
  };
});

module.exports = router;
