import 'core-js/stable';
import '~models/register';

import { Nohm } from 'nohm';

import redis from 'redis';
import { serverHttp, serverExpress } from '~server';

import { info } from '~lib/logger';
import flakeUuid from '~lib/flake-uuid';

import registerEvents from '~events/index';
import registerRoutes from '~routes/index';

// import createEvent from 'src/__helper/create-event';
// import eventObject from 'src/__helper/event--demo';

const clientRedis = redis.createClient(process.env.REDIS_URL || '');

async function startServer(): Promise<void> {
  const port = process.env.PORT || 3000;

  // try {
  //   await createEvent({
  //     event: eventObject,
  //   });
  // } catch (err) {
  //   /* nothing */
  // }

  await registerEvents();
  await registerRoutes(serverExpress);

  serverHttp.listen(port, () => {
    info('Server listening at *:3000');
  });
}

clientRedis.once('ready', () => {
  Nohm.setClient(clientRedis);
  Nohm.setPrefix('feedbax-dev');

  startServer();
});


// eslint-disable-next-line import/prefer-default-export
export const workerId = flakeUuid();
