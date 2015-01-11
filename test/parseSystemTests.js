'use strict';

var expect = require('must');

var parseSystem = require('../lib/parseSystem.js');

describe('parseSystem.js:', function() {
  it('should err on missing result', function() {
    parseSystem(null, null, function(err) {
      expect(err).to.be.truthy();
    });
  });
});