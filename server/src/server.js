import "core-js/stable";
import "regenerator-runtime/runtime";
import path from "path";
import fs from "fs";
import * as express from "express";
import compression from "compression";
import { graphqlHTTP } from 'express-graphql';
import bodyParser from "body-parser";
import cors from "cors";
import csp from "content-security-policy";
import mongoose from "mongoose";
import schema from "./graphql/schema";

const MONGO_CONF_F = "/etc/sensors/mongo.json";

const fail = (error) => {
  console.error(error);
  process.exit(255);
};

const connect = () => {
  try {
    const mongoConfig = JSON.parse(fs.readFileSync(path.resolve(MONGO_CONF_F)));
    const { uid, pwd, host, port, database, collection } = mongoConfig;
    const mongoUri = `mongodb://${host}:${port}`;

    return mongoose
      .connect(mongoUri, {
        dbName: database,
        user: encodeURI(uid),
        pass: encodeURI(pwd),
        family: 4,
        connectTimeoutMS: 10000,
      })
      .catch(fail);
  } catch (e) {
    fail(e);
  }
};

connect().then((connection) => {
  console.log("MongoDB connected");

  const app = express();
  const appPort = process.env.APP_PORT || "80";

  app.use(
    csp.getCSP({
      "default-src": csp.SRC_SELF,
      "style-src": [csp.SRC_SELF, csp.SRC_USAFE_INLINE],
      "img-src": [csp.SRC_SELF, "https://openweathermap.org/img/wn/"]
    })
  );
  app.use(compression());
  app.use(
    "/",
    cors({ origin: true, methods: "GET" }),
    express.static(path.resolve("./build/ui"))
  );

  app.use(
    "/api",
    cors({ origin: true, methods: "POST" }),
    bodyParser.json(),
    graphqlHTTP({
      schema,
      context: { db: connection },
      graphiql: true,
    })
  );

  app.listen(appPort, () =>
    console.log(`Application listening on port ${appPort}`)
  );
});
