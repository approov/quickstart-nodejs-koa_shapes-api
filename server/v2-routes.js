// shapes api server - v2 protected routes

const { debug } = require('./utils');
const Router = require('koa-router');
const { verifyToken, verifyBoundToken } = require('./auth');

const ENFORCE_APPROOV = (process.env.ENFORCE_APPROOV || 'true') == 'true';

// handle routes

const router = new Router({
  prefix: '/v2'
});

// authorize routes

router.use('/shapes', async (ctx, next) => {
  const { valid, status } = verifyToken(ctx);

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

  await next();
});

router.use(['/forms'], async (ctx, next) => {
  const { valid, status } = verifyBoundToken(ctx);

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
    status: `${shape} (approoved)`
  };
});

const forms = [ 'Box', 'Cone', 'Cube', 'Sphere' ];

router.get('/forms', async ctx => {
  const form = forms[Math.floor((Math.random() * forms.length))];
  debug(`form: ${form}`);
  ctx.body = {
    form,
    status: `${form} (approoved)`
  };
});

module.exports = router;

// end of file
