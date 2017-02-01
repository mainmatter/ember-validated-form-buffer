'use strict';

/* eslint-env node */

module.exports = function(app) {
  let globSync = require('glob').sync;
  let bodyParser = require('body-parser');
  let mocks = globSync('./mocks/**/*.js', { cwd: __dirname }).map(require);
  let proxies = globSync('./proxies/**/*.js', { cwd: __dirname }).map(require);

  app.use(bodyParser.json({ type: 'application/*+json' }));
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  // Log proxy requests
  let morgan = require('morgan');
  app.use(morgan('dev'));

  mocks.forEach(function(route) { route(app); });
  proxies.forEach(function(route) { route(app); });
};
