# Approov Shapes Server Testing

A guide for testing the Approov Shapes Server.


## Configure the Environment

In order to use the Postman collection it's necessary that the Shapes server is started with this `.env` file:

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

## Testing with Postman

The Shapes API can be tested in Localhost or in a Production staging server with [this Postman collection](https://raw.githubusercontent.com/approov/postman-collections/master/quickstarts/shapes-api/shapes-api.postman_collection.json).

You can use this same Postman collection to test the Production server, but then you need to manually update the `Approov-Token` header for each valid request example in the collection with an example token from the Approov CLI:

```
approov token -genExample shapes.approov.io
```
