# Approov Shapes Server Traefik Deployment Guide

A deployment guide for the Approov shapes demo server used by quickstarts and demos for Approov.

We will use a bash script to deploy, via ssh, the Shapes server in a docker container, that is then served by Traefik.

The following instructions will assume that you are an Approov employee with access to the production servers and that you are at the root of this repo on your computer.

## Configure the Environment

You can deploy to `dev`, `staging` and `prod` environments and each of
this envs have their own env file in the format of `.env.${RELEASE_ENV}.deploy`, therefore this file must exist at the root of this project with the **required** environment variables.

Before you deploy the first time to an environment you need to manually create a `.env.${RELEASE_ENV}.deploy` file at the root of this repo with the following content:

```bash
# .env.prod.deploy

############################
# SSH SPECIFIC
############################

#REMOTE_PORT=22
REMOTE_PORT=___SSH_REMOTE_PORT_HERE___

#REMOTE_USER=ec2-user
REMOTE_USER=___SSH_REMOTE_USER_HERE___

#REMOTE_ADDRESS=demo.aproov.io
REMOTE_ADDRESS=___SSH_REMOTE_ADDRESS_HERE___


############################
# SHAPES SERVER SPECIFIC
############################

# If the server has already been deployed at least once then you can copy the
# contents of the remote .env file to this file to have API_KEY and
# APPROOV_SECRET correct values.
# Execute from your terminal the command:

# Get it from the VAULT or from the production server
API_KEY=___API_KEY_HERE___

# Get it from the Approov demo account: approov secret -get base64
APPROOV_SECRET=___APPROOV_BASE64_ENCODED_SECRET_HERE___
```

During deployment the content of `.env.${RELEASE_ENV}.deploy` file on your machine will be copied to the `.env` file of the remote server you are deploying to.


## Deploy the Shapes API to the Remote Server

In below commands replace `staging` with `dev` or `prod` to match the environment you want to target in the deployment.

See your options to deploy:

```console
./deploy --help
```

When the Shapes backend doesn't exist yet in the remote server for the env you want to deploy, then you need to use the `--env-type` option set to `local`:

```bash
 ./deploy --env staging --env-type local --from master run
```

Next time you deploy the Shapes backend you can omit the use of the `--env-type` option, unless you have modified the env file and want to reflect it in the remote env. For example:

```bash
 ./deploy --env staging --from master run
```

or you can be explicit:

```bash
 ./deploy --env staging --env-type remote --from master run
```

The URL for the Shapes server can be found at:

```bash
echo $(id -un).staging.shapes.demo.approov.io
```

That on my machine returns `exadra37.staging.shapes.demo.approov.io`.

Traefik will detect the container and create on the fly a new certificate for the domain(s) specified in the `PUBLIC_DOMAIN` env var of the `.env` file, and when the time arrives, will be in charge of renewing it with the same public key.

### Tail the Logs in the Remote Server

From your machine execute:

```bash
./deploy --env prod logs
```

Replace `prod` with `dev` or `staging` a per which logs you want to see.

### Shooting down the Remote Shapes Server

From your machine execute:

```bash
./deploy down dev
```

To avoid mistakes shutting down for `prod` is not supported.

### Booting Up the Remote Shapes Server

From your machine execute:

```bash
./deploy up staging
```

Booting `prod` is not supported.


## Troubleshooting Deployment

Otherwise stated run the commands in the remote server from the folder of the target deployment.

The deployment creates only 3 files in the remote server:
* `.env` - contains specific env vars for the deployment and env vars to override the `.env.default` ones. This is the most important file to look at when gathering info about a deployment
* `.env.default` - the env vars with the default values, which is tracked by git. Customise this env vars by adding them to the `.env` file.
* `docker-compose.yml` - used to start the docker service `node` with the `DOCKER_IMAGE` and `PUBLIC_DOMAIN` set in the `.env` file.

### HTTPS doesn't' work

If you visit the domain for the server in the browser and it doesn't trust in the provided certificate then this means an error occurred while Traefik was trying to create the LetsEncrypt certificate on the fly.

Check the logs at `/opt/treafik` by running from this folder the command:

```console
sudo docker-compose logs
```

Look in the output for error messages related to certificates and handle them accordingly.

After solving the error you may need to restart Traefik:

```console
sudo docker-compose down
sudo docker-compose up --detach
```

Tail the logs to watch for errors:

```console
sudo docker-compose logs --follow
```

### Find which Domain(s) were Used

```console
grep -irn PUBLIC_DOMAIN .env
```

If you are in the correct folder you should see a result with the domain(s) being used.

### Find which Docker Image was Used

```console
grep -irn DOCKER_IMAGE .env
```

If you are in the correct folder you should see a result with the docker image being used.

### Find which Branch was Used

```console
grep -irn BUILD_RELEASE_FROM .env
```

If you are in the correct folder you should see a result with name of the branch.

