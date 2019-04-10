// shapes api server - v1 protected routes

const { debug } = require('./utils');
const Router = require('koa-router');
const { verifyToken, verifyTaggedToken } = require('./auth');

const ENFORCE_APPROOV = (process.env.ENFORCE_APPROOV || 'true') == 'true';

// handle routes

const router = new Router();

// authorize routes

router.use('/shapes', async (ctx, next) => {
  const { valid, status } = verifyToken(ctx);

  if (!valid) {
    if (ENFORCE_APPROOV) {
      debug(`authorization failed: ${status} - error`);
      ctx.throw(400);
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
  ctx.body = hello;
});

const shapes = [ 'Circle', 'Rectangle', 'Square', 'Triangle' ];

router.get('/shapes', async ctx => {
  const shape = shapes[Math.floor((Math.random() * shapes.length))];
  debug(`shape: ${shape}`);
  ctx.body = shape;
});

module.exports = router;

// end of file
