module.exports = function(app) {
  var express     = require('express');
  var usersRouter = express.Router();

  usersRouter.get('/:id', function(req, res) {
    var result = { data: { id: 1, type: 'users', attributes: { name: 'test' } } };
    res.status(200).send(result);
  });

  usersRouter.patch('/:id', function(req, res) {
    var result = {
      errors: [
        { source: { pointer: '/data/attributes/name' }, title: 'too short' },
        { source: { pointer: '/data/attributes/time' }, title: 'users can only be created at a certain time' }
      ]
    };
    res.status(422).send(result);
  });

  app.use('/users', usersRouter);
};
