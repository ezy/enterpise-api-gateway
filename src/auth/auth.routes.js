const router = require('express').Router();

const controller = require('./auth.controller');

router.route('/token')
  .post(controller.authenticate);

module.exports = router;
