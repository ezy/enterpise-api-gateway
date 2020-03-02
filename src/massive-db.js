const massive = require('massive');

const config = require('./config').massive;

let massiveDb;

const getDb = () => {
  if (massiveDb) {
    return massiveDb;
  }

  return massive(config, {
    documentPkType: 'uuid',
    uuidVersion: 'v4',
  })
    .then((instance) => {
      massiveDb = instance;
      return Promise.resolve(massiveDb);
    });
};

module.exports = getDb;
