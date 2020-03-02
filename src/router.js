const jwt = require('express-jwt');
const each = require('lodash/each');
const proxy = require('http-proxy-middleware');
const healthCheck = require('express-healthcheck');

const config = require('./config');
const authRoutes = require('./auth/auth.routes');

const secret = config.secrets.jwt;

module.exports = (app) => {
  app.use('/oauth', authRoutes);
  app.get('/health', healthCheck({
    healthy() {
      return { status: 'ok', uptime: process.uptime() };
    },
  }));

  each(config.routes, (route, k) => {
    each(route, (r) => {
      const host = r.host || config.hostUrl;
      // setup route from config file
      const routeConfig = [
        r.path,
        r.auth ? jwt({ secret }) : null,
        proxy({
          target: `${host}`,
          changeOrigin: true,
          secure: false,
        }),
      ];
      // use http req type key to cycle and create routes dynamically
      app[k](...routeConfig.filter(e => e));
    });
  });
};
