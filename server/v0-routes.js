// shapes api server - v1 protected routes

const { debug } = require('./utils');
const Router = require('koa-router');

// handle routes

const router = new Router();

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
