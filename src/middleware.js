const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const winston = require('winston');
const expressWinston = require('express-winston');

const getMassiveDb = require('./massive-db');

module.exports = (app) => {
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(helmet());
  app.use(cors());
  app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console(),
    ],
    requestWhitelist: ['url', 'method', 'httpVersion', 'originalUrl', 'query'],
    format: winston.format.combine(
      winston.format.json(),
    ),
  }));
  getMassiveDb()
    .then((db) => {
      app.set('massiveDb', db);
      return Promise.resolve();
    })
    .catch(err => console.log(err));
};
