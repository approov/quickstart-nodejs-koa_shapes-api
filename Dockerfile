FROM node:11

ARG DOCKER_BUILD_SCRIPTS_RELEASE=dev-wip

ENV \
  DEBIAN_FRONTEND="noninteractive" \
  NO_AT_BRIDGE=1 \
  DOCKER_BUILD="/docker-build"

# Ensures the commands we are about to run are executed by the root user.
USER root

ADD ./docker/.certificates /.certificates

# Always update the base image in order to get the last security fixes
RUN \
  apt update && \
  apt -y upgrade && \
  apt -y -q install --no-install-recommends \
    ca-certificates \
    unzip \
    curl && \

mkdir -p "${DOCKER_BUILD}" && \

curl \
  -fsSl \
  -o archive.tar.gz \
  https://gitlab.com/exadra37-bash/docker/bash-scripts-for-docker-builds/-/archive/"${DOCKER_BUILD_SCRIPTS_RELEASE}"/bash-scripts-for-docker-builds-dev.tar.gz?path=scripts && \

tar xf archive.tar.gz -C "${DOCKER_BUILD}" --strip 1 && \

rm -vf archive.tar.gz && \

"${DOCKER_BUILD}"/scripts/custom-ssl/operating-system/add-custom-authority-certificate.sh \
  "/.certificates/ProxyCA.crt" \
  /usr/local/share/ca-certificates && \

"${DOCKER_BUILD}"/scripts/custom-ssl/nodejs/add-certificate-to-server.sh \
  "/etc/ssl/certs/ProxyCA.pem" \
  "/home/node" && \

npm install pm2 -g

# We should never run containers as root, just like we do not run as root in our PCs and production servers.
USER node

# We need to explicitly create the app dir to have the user `node` ownership, otherwise will have `root` ownership.
RUN mkdir -p /home/node/app

# Setuo working directory inside the container
WORKDIR /home/node/app

# Copy app source into the docker image with the correct ownership
COPY --chown=node:node . .

RUN \
  npm install && \
  npm audit fix

# Start the app
CMD [ "pm2-runtime", "server/index.js" ]
