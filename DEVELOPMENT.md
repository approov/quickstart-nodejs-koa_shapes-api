# Approov Shapes Server - Node-Koa

A development guide for the Approov shapes demo server used by quickstarts and demos for Approov.


## Setup

Follow the instructions in [TESTING.md](/TESTING.md) to create the `.env` file and download the Postman collection.


## Developing with the Docker Stack

The `docker-compose.yml` file declares the service `dev` that you can used for localhost development, without the need to rebuild the docker image each time changes are made to the code.

### Build the docker stack

```bash
sudo docker-compose build dev
```

### Run the Shapes server

```bash
sudo docker-compose up --detach dev
```

Now, each time your code is saved the Shapes server is restarted and all you need is to issues new requests against it to test your changes.

The only time you need to reload the docker stack is when you changes anything in the `.env` file.

### Reload the Shapes Server

```bash
sudo docker-compose down && sudo docker-compose up --detach dev
```

### Tail the logs

```bash
sudo docker-compose logs --follow dev
```

### Destroy the Shapes Server

```bash
sudo docker-compose down
```
