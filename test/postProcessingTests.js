'use strict';

var expect = require('must');

var postProcessing = require('../lib/postProcessing.js');

describe('postProcessing.js:', function() {
  it('should err on missing result', function() {
    postProcessing(null, null, function(err) {
      expect(err).to.be.truthy();
    });
  });

  it('should remove the resources field from the result', function() {
    var emptyResult = {
      containerDefinitions: [],
      topology: {
        containers: {}
      },
      resources: {
        resourceGroups: []
      }
    };

    postProcessing(null, emptyResult, function(err) {
      expect(emptyResult.resources).to.be.falsy();
    });
  });
});