module.exports = function(app) {
  var express     = require('express');
  var usersRouter = express.Router();

  usersRouter.get('/:id', function(req, res) {
    var result = { user: { id: 1, name: 'test' } };
    res.status(200).send(result);
  });

  app.use('/users', usersRouter);
};
