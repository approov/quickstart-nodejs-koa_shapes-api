# Approov 2 Shapes Server - Node-Koa

Approov 2 shapes server using node.js with koa.

## TOC

* [Traefik Production Deployment](#traefik-production-deployment)
* [Localhost Usage for Development](#localhost-usage-for-development)
* [Postman Collection](#postman-collection)
* [License](#license)

## TRAEFIK PRODUCTION DEPLOYMENT

### Configure the Environment

Create a `.env` file in the root of this project:

```bash
# Used to start the NodeJS Koa server and to tell Traefik what port to use to
# reach the server in the docker network for Traefik, thus this port it's
# internal and never exposed to the host machine or the internet.
HTTP_PORT=8002

# The domain that Traefik will be listening for https requests on port 443. All
# http requests to port 80 will be automatically redirected to https port 443.
PUBLIC_DOMAIN=shapes.approov.io

# Get it with: approov secret -get base64
APPROOV_SECRET=approov-base64-encoded-secret-here

# To try out this quickstart you can quickly generate an API key with:
# $ strings /dev/urandom | grep -o '[[:alpha:]]' | head -n 128 | tr -d '\n'; echo
API_KEY=your_api_key_here
```

[TOC](#toc)

### Start the Server

Start it with docker compose:

```
docker-compose up -d
```

Traefik will detect the container and create on the fly a new certificate for the domain we specified in `PUBLIC_DOMAIN`, and when the time arrives, will be in charge of renewing it with the same public key.

[TOC](#toc)

### Tail the Server Logs

```
sudo docker-compose logs --follow --tail 10
```

[TOC](#toc)

### Destroy the Server

```
docker-compose down
```

[TOC](#toc)


## LOCALHOST USAGE FOR DEVELOPMENT

```
$ ./stack --help

DOCKER STACK CLI WRAPPER

This bash script is a wrapper around docker commands to build and run the nodejs server.

Signature:
  ./stack [options] <command>


Usage:
  ./stack
  ./stack [-h | --help] [-u | --user] <command>


Options:
  -h | --help  Shows this help.
  -p | --port  The host port to access the docker container.
  -u | --user  Set the user to use in the docker container.


Commands/Args:
  build     Builds the docker image for this stack:
              ./stack build

  up        Starts the nodejs server:
              ./stack up
              ./stack --port 3000 up

  shell     Starts a shell in the docker container:
              ./stack shell
              ./stack --user root shell
              ./stack --port 3000 --user root shell


```

[TOC](#toc)


## POSTMAN COLLECTION

The Shapes API can be tested in Localhost or in a Production staging server with [this Postman collection](https://raw.githubusercontent.com/approov/postman-collections/master/quickstarts/shapes-api/shapes-api.postman_collection.json).

To use it you will need to start the server with this `.env` file:

```bash
PUBLIC_DOMAIN=your.domain.com
HTTP_PORT=8002
ENABLE_LOGGING=true

# Feel free to play with different secrets. For development you can create them with:
# $ openssl rand -base64 64 | tr -d '\n'; echo
APPROOV_SECRET=h+CX0tOzdAAR9l15bWAqvq7w9olk66daIH+Xk+IAHhVVHszjDzeGobzNnqyRze3lw/WVyWrc2gZfh3XXfBOmww==

# Dummy API Key for the v3 endpoint was generated with:
# $ strings /dev/urandom | grep -o '[[:alpha:]]' | head -n 25 | tr -d '\n'; echo
API_KEY=yXClypapWNHIifHUWmBIyPFAm
```

Please adjust `your.domain.com` to the domain being used by your server or just replace with `localhost` when running the Shapes API server from your own machine.

You can use this same Postman collection to test the Production server, but then you need to manually update the `Approov-Token` header for each valid request example in the collection with an example token from the Approov CLI:

```
approov token -genExample shapes.approov.io
```

[TOC](#toc)


## LICENSE

----

Copyright 2021 CriticalBlue, Ltd.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

----

[TOC](#toc)
