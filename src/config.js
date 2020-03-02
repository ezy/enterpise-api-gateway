module.exports = {
  host: process.env.HOST,
  env: process.env.NODE_ENV,
  hostUrl: "http://host.docker.internal:5000/v1",
  authKey: true,
  apiKey: "123456",
  ldap: {
    hostUrl: process.env.LDAP_URL,
    user: process.env.LDAP_USER,
    pass: process.env.LDAP_PASS
  },
  jwtExpiry: 31557600,
  refreshExpiry: 31557600,
  secrets: {
    jwt: process.env.JWT_SECRET,
    refresh: process.env.REFRESH_SECRET
  },
  massive: {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    ssl: false,
    poolSize: 10
  },
  protocol: "http",
  http: {
    port: process.env.PORT || 8081
  },
  https: {
    port: process.env.PORT || 8443,
    cert: "bundle.pem",
    key: "privateKey.pem",
    ca: "authority.pem"
  },
  routes: {
    get: [
      {
        host: "https://httpbin.org",
        path: "/status/200",
        auth: true
      },
      {
        host: "https://jsonplaceholder.typicode.com",
        path: "/posts",
        auth: true
      },
      {
        path: "/users/:id",
        auth: true
      },
      {
        path: "/posts/:id",
        auth: true
      },
      {
        path: "/categories",
        auth: true
      }
    ],
    post: [],
    put: [],
    delete: []
  }
};
