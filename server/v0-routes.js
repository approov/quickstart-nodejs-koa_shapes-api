// shapes api server

const { debug } = require('./utils');
const Router = require('koa-router');

// handle routes

const router = new Router();

const invite = `<!DOCTYPE html>
  <html><body>
    <h1>Approov Mobile App Authentication</h1>
    <P>To learn more about how Approov protects your APIs from
    malicious bots and tampered or fake apps, see
    <a href="https://approov.io/docs">https://approov.io/docs</a>.</p>
  </body></html>`;

router.get('/', async ctx => {
  debug(`text: ${invite}`);
  ctx.type = 'html';
  ctx.body = invite;
});

module.exports = router;

// end of file
