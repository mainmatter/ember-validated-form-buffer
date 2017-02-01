'use strict';

/* eslint-env node */

module.exports = function(app) {
  let express = require('express');
  let usersRouter = express.Router();

  usersRouter.get('/:id', function(req, res) {
    let result = { data: { id: 1, type: 'users', attributes: { name: 'test' } } };
    res.status(200).send(result);
  });

  usersRouter.patch('/:id', function(req, res) {
    let result = {
      errors: [
        { source: { pointer: '/data/attributes/name' }, title: 'too short' }
      ]
    };
    res.status(422).send(result);
  });

  app.use('/users', usersRouter);
};
