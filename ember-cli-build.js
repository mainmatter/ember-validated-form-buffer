/*jshint node:true*/
/* global require, module */
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    jscsOptions: {
      enabled: true,
      testGenerator: function(relativePath, errors) {
        if (errors) {
          errors = "\\n" + this.escapeErrorString(errors);
        } else {
          errors = "";
        }
    
        return "describe('JSCS - " + relativePath + "', function() {\n" +
          "it('should pass jscs', function() { \n" +
          "  expect(" + !errors + ", '" + relativePath + " should pass jscs." + errors + "').to.be.ok; \n" +
          "})});\n";
      }
    }
  });

  return app.toTree();
};
