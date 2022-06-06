# Approov Shapes Server Traefik Deployment Guide

A deployment guide for the Approov shapes demo server used by quickstarts and demos for Approov.

We will use a bash script to deploy, via ssh, the Shapes server in a docker container, that is then served by Traefik.

The following instructions will assume that you are an Approov employee with access to the production servers and that you are at the root of this repo on your computer.

## Configure the Environment

You will need to create or update the `.env.${RELEASE_ENV}.deploy` file at the root of this project with the **required** environment variables.

### For when the remote server already exists

If you don't have yet the `.env.${RELEASE_ENV}.deploy` files in your machine then create one.

For `dev`:

```bash
echo "REMOTE_USER=___SSH_REMOTE_USER_HERE___" > .env.dev.deploy
```

and then update it with:

```bash
./deploy --env dev update-env
```

For `staging`:

```bash
echo "REMOTE_USER=___SSH_REMOTE_USER_HERE___" > .env.staging.deploy
```

and then update it with:

```bash
./deploy --env staging update-env
```

For `prod`:

```bash
echo "REMOTE_USER=___SSH_REMOTE_USER_HERE___" > .env.prod.deploy
```

and then update it with:

```bash
./deploy --env prod update-env
```

### For when the remote server doesn't exist yet

Manually create a `.env.${RELEASE_ENV}.deploy` file at the root of this repo with the following content:

```bash
############################
# SSH SPECIFIC
############################

REMOTE_USER=___SSH_REMOTE_USER_HERE___


############################
# SHAPES SERVER SPECIFIC
############################

# Get it from the vault or from the production server
API_KEY=___API_KEY_HERE___

# Get it from the Approov demo account: approov secret -get base64
APPROOV_SECRET=___APPROOV_BASE64_ENCODED_SECRET_HERE___
```

## Deploy the Shapes API to the Remote Server

See your options to deploy:

```console
./deploy --help
```

When the Shapes backend doesn't exist the remote server for the env yout want to deploy, then you need to use the local `.env.${RELEASE_ENV}.deploy` file:

```bash
 ./deploy --env staging --env-type local --from master run
```

Next time you deploy the Shapes backend you can skip the use of the local env deploy file, unless you have modified it. For example:

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


Replace `staging` with `dev` or `prod` to match the environment you want to target in the deployment.

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
