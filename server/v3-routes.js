const { debug } = require('./utils');
const Router = require('koa-router');
const { verifyApiKey } = require('./api-key');
const { verifyToken, verifyApproovTokenBinding } = require('./auth');

const ENFORCE_APPROOV = (process.env.ENFORCE_APPROOV || 'true') == 'true';

// handle routes

const router = new Router({
  prefix: '/v3'
});

const abortOnInvalidApiKey = (ctx) => {
  const { valid, status } = verifyApiKey(ctx);

  if (!valid) {
    debug(`api key validation failed: ${status} - error`);
    ctx.throw(400, status);
  }

  debug(`api key is valid`);
}

// authorize routes

const abortOnInvalidApproovToken = ({ valid, status }) => {
  if (!valid) {
    if (ENFORCE_APPROOV) {
      debug(`authorization failed: ${status} - error`);
      ctx.throw(400, status);
    } else {
      debug(`authorization failed: ${status} - warning only`);
    }
  } else {
    debug('authorization passed');
  }
}

router.use('/shapes', async (ctx, next) => {
  const result = verifyToken(ctx);

  abortOnInvalidApproovToken(result);

  abortOnInvalidApiKey(ctx);

  await next();
});

router.use(['/forms'], async (ctx, next) => {
  const result = verifyApproovTokenBinding(ctx);

  abortOnInvalidApproovToken(result);

  abortOnInvalidApiKey(ctx);

  await next();
});

// handle authorized routes

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
    status: `${shape} (api key valid)`
  };
});

const forms = [ 'Box', 'Cone', 'Cube', 'Sphere' ];

router.get('/forms', async ctx => {
  const form = forms[Math.floor((Math.random() * forms.length))];
  debug(`form: ${form}`);
  ctx.body = {
    form,
    status: `${form} (api key valid)`
  };
});

module.exports = router;
