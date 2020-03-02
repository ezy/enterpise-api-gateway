# Node API Gateway

An API gateway with an inbuilt OAuth2 server that will run in a docker container, authenticate against an LDAP server returning JWT and refresh tokens, then generates routes to proxy from `src/config.js` to the target URL.

## Installation

You'll need docker if you don't already have it installed.

Copy `.example.env` to `.env.development` and update the passwords for access. Adjust `src/config.js` to include setting your proxy urls:

```sh
# Build and start your server
docker-compose up --build
```

API will be available at `localhost:<PORT>` for http requests.

## API Endpoints

Specify your endpoints in `src/config.js` under the `routes` object using the correct request method object (get,post,put,delete). Routes will be generated at runtime from this list using the following configuration:

- host: { string } over-rides `hostUrl` to specify proxy target host,
- path: { string } the target path for the req and res,
- auth: { boolean } set to true to require JWT authentication for the endpoint

### Oauth2 Authentication

The gateway acts as it's own Oauth2 server using a JWT and refresh token for authentication. All auth grant types reside at the `/oauth/token` endpoint.

#### Password grant

Initial authentication should be with the following REST structure

- POST
- Uses req.body: `{ "grant_type": "password", "username": "zz001", "password": "S3cur3", "scope": "openid profile", "client_id": "xxx" }`
- Headers: `{ "Content-Type": "application/json" }`

To return:

```json
{
    "access_token": "{{access_token}}",
    "token_type": "Bearer",
    "expires_in": 31557600,
    "refresh_token": "{{refresh_token}}",
    "uid": "ZZ001C"
}
```

#### Refresh grant

If the JWT token has expired a refresh grant should be made to the `/oauth/token` endpoint with a valid refresh_token.

- POST
- Uses req.body: `{ "grant_type": "refresh_token", "refresh_token": "{{refresh_token}}", "client_id": "xxx" }`
- Headers: `{ "Content-Type": "application/json" }`

To return:

```json
{
    "access_token": "{{access_token}}",
    "token_type": "Bearer",
    "expires_in": 31557600,
    "refresh_token": "{{refresh_token}}",
    "uid": "ZZ001C"
}
```

#### Decoded JWT token data example

```json
{
  "iss": "http://localhost",
  "aud": "https://localhost:5000/v1",
  "sub": "ZZ001",
  "email": "Zach.Zoolander@email.com",
  "identityContext": "0",
  "scopes": "read,write",
  "iat": 1557807257,
  "exp": 1589364857
}
```

#### Decoded refresh token example

The refresh token isn't dependant on the decoded JWT data, but the Oauth server does validate the token for expiry and authenticity using the secret as an extra layer of security.

```json
{
  "sub": "ZZ001",
  "iat": 1557807430,
  "exp": 1589365030
}
```

## HTTP / HTTPS

App is configured for both http and https and runs http out of the box. To enable https generate (or provide) your https certs - `privateKey.pem, certificate.pem, authority.pem (optional)` - in the root directory, and set `config.protocol: 'https'`.

### Postman client

Import the postman file located at `./node_api.postman_collection.json` to test the endpoints.
