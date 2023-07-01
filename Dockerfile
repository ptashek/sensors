FROM node:18-bullseye-slim as base
RUN apt-get update && apt-get -y upgrade

WORKDIR /

COPY server/src /server/src
COPY server/package*.json /server/
COPY server/*.webpack.js /server/
COPY server/babel.config.json /server/

COPY client/src /client/src
COPY client/package*.json /client/
COPY client/*.webpack.js /client/
COPY client/relay.config.js /client/
COPY client/babel.config.json /client/

WORKDIR /server
RUN npm ci --no-fund --no-audit
RUN npm run build

WORKDIR /client
RUN npm ci --no-fund --no-audit
RUN npm run relay && npm run prod-build

FROM node:18-bullseye-slim as interim
RUN mkdir /var/app && chown -R root:node /var/app && chmod 0750 /var/app
WORKDIR /var/app

COPY --from=base --chown=root:node /server/build .
COPY --from=base --chown=root:node /server/package*.json .
RUN npm ci --omit=dev,optional --no-fund --no-audit
RUN rm package*.json

FROM node:18-bullseye-slim as final
RUN apt-get update && apt-get -y upgrade && apt-get install -y --no-install-recommends dumb-init

RUN mkdir /var/app && chown -R root:node /var/app && chmod 0750 /var/app

WORKDIR /var/app
COPY --from=interim --chown=root:node /var/app .

VOLUME [ "/etc/sensors" ]

EXPOSE 3000

USER node
CMD [ "dumb-init", "node", "/var/app/server.js" ]