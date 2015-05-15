module.exports = function(app) {
  var express     = require('express');
  var usersRouter = express.Router();

  usersRouter.get('/:id', function(req, res) {
    var result = { user: { id: 1, name: 'test' } };
    res.status(200).send(result);
  });

  usersRouter.put('/:id', function(req, res) {
    var result = { errors: { name: ['too short'], time: ['users can only be created at a certain time'] } };
    res.status(422).send(result);
  });

  app.use('/users', usersRouter);
};
