import 'core-js/stable';
import 'regenerator-runtime';
import path from 'path';
import fs from 'fs';
import * as express from 'express';
import compression from 'compression';
import { createHandler } from 'graphql-http/lib/use/express';
import bodyParser from 'body-parser';
import cors from 'cors';
import csp from 'content-security-policy';
import mongoose from 'mongoose';
import schema from './graphql/schema';

const MONGO_CONF_F = '/etc/sensors/mongo.json';
const IS_PROD = process.env.DEV_SERVER !== '1';

const fail = (error) => {
  console.error(error);
  process.exit(255);
};

const connect = async () => {
  try {
    const mongoConfig = JSON.parse(fs.readFileSync(path.resolve(MONGO_CONF_F)));
    const { uid, pwd, host, port, database, collection } = mongoConfig;
    const mongoUri = `mongodb://${host}:${port}`;

    return mongoose.connect(mongoUri, {
      dbName: database,
      user: encodeURI(uid),
      pass: encodeURI(pwd),
      family: 4,
      connectTimeoutMS: 10000,
    });
  } catch (e) {
    fail(e);
  }
};

const connection = await connect();
console.log('MongoDB connected');

const app = express();
const appPort = process.env.APP_PORT || '3000';

app.use(compression());
app.use(
  '/',
  cors({ origin: true, methods: 'GET' }),
  csp.getCSP({
    'default-src': csp.SRC_SELF,
    'style-src': [csp.SRC_SELF, csp.SRC_USAFE_INLINE, 'https://fonts.googleapis.com/css'],
    'img-src': [csp.SRC_SELF, 'https://openweathermap.org/img/wn/'],
    'font-src': [
      csp.SRC_SELF,
      'https://fonts.googleapis.com/',
      'https://fonts.gstatic.com/s/lato/',
    ],
  }),
  express.static(path.resolve(IS_PROD ? './ui' : './build/ui')),
);

app.use(
  '/api',
  cors({ origin: true, methods: 'POST' }),
  csp.getCSP({
    'default-src': IS_PROD
      ? csp.SRC_SELF
      : [csp.SRC_SELF, csp.SRC_USAFE_INLINE, csp.SRC_UNSAFE_EVAL],
  }),
  bodyParser.json(),
  createHandler({
    schema,
    context: { db: connection },
    graphiql: !IS_PROD,
  }),
);

app.listen(appPort, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`Application listening on port ${appPort}`);
  }
});

const closeGracefully = (signal) => {
  console.log('Closing gracefully');
  mongoose.connection.close();
  process.kill(process.pid, signal);
};

process.once('SIGINT', closeGracefully);
process.once('SIGTERM', closeGracefully);
