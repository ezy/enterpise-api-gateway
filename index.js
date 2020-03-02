const express = require('express');
const winston = require('winston');
const expressWinston = require('express-winston');
const https = require('https');
const fs = require('fs');

const config = require('./src/config.js');

require('dotenv').config();

const app = express();

require('./src/middleware')(app);
require('./src/router')(app);

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console(),
  ],
  requestWhitelist: ['url', 'method', 'httpVersion', 'originalUrl', 'query'],
  format: winston.format.combine(
    winston.format.json(),
  ),
}));

app.use((req, res, next) => {
  res.status(404);
  res.json({
    error: {
      status: 404,
      message: `Cannot ${req.method} ${req.url}`,
    },
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  error.status = 500;
  error.message = 'Internal server error';
  res.status(500).json({
    error,
    from: 'NODE GATEWAY',
  });
});

const logUrl = (protocol) => {
  console.log(`Server started | ENV=${config.env} | ${protocol}://${config.host}:${config[protocol].port}`);
};

if (config.protocol === 'http') {
  this.http = app.listen(config.http.port, logUrl('http'));
}
if (config.protocol === 'https') {
  const key = fs.readFileSync(config.https.key, 'utf8');
  const cert = fs.readFileSync(config.https.cert, 'utf8');
  const ca = config.https.ca ? fs.readFileSync(config.https.ca, 'utf8') : undefined;
  this.https = https.createServer({ key, cert, ca }, app)
    .listen(config.https.port, logUrl('https'));
}
