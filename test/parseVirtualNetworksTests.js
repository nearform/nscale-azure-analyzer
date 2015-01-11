'use strict';

var expect = require('must');
var _ = require('lodash');

var parseVirtualNetworks = require('../lib/parseVirtualNetworks.js');

describe('parseVirtualNetworks.js:', function() {
  var emptyResult;
  var basicResult;
  var withParentResult;

  beforeEach(function() {
    emptyResult = {
      containerDefinitions: [],
      topology: {
        containers: {}
      },
      resources: {
        virtualNetworks: []
      }
    };

    basicResult = _.cloneDeep(emptyResult);
    basicResult.resources.virtualNetworks.push({
      id: 'vnId',
      name: 'vnName',
      type: 'vnType',
      location: 'vnLocation',
      resourceGroupId: 'rgId',
      tags: []
    });

    withParentResult = _.cloneDeep(basicResult);
    withParentResult.topology.containers['rgId'] = {
      id: 'rgId',
      contains: [],
    };
  });

  it('should err on missing result', function() {
    parseVirtualNetworks(null, null, function(err) {
      expect(err).to.be.truthy();
    });
  });

  it('should not err with valid result', function() {
    parseVirtualNetworks(null, emptyResult, function(err) {
      expect(err).to.be.falsy();
    });
  });

  it('should not modify result unless there is data to do so', function() {
    var initialResult = _.cloneDeep(emptyResult);
    parseVirtualNetworks(null, emptyResult, function(err) {
      expect(emptyResult).to.be.eql(initialResult);
    });
  });

  it('should create a valid container entry', function() {
    parseVirtualNetworks(null, basicResult, function(err) {
      var container = basicResult.topology.containers['vnId'];
      expect(container).to.be.truthy();

      expect(container.id).to.be.equal('vnId');
      expect(container.nativeId).to.be.equal('vnId');
      expect(container.name).to.be.equal('vnName');
      expect(container.containedBy).to.be.equal('rgId');
      expect(container.containerDefinitionId).to.be.equal('vnId');
      expect(container.contains).to.be.eql([]);
      expect(container.type).to.be.equal('azure-vn');

      expect(container.specific.resourceId).to.be.equal('vnId');
      expect(container.specific.resourceName).to.be.equal('vnName');
      expect(container.specific.resourceType).to.be.equal('vnType');
      expect(container.specific.resourceLocation).to.be.equal('vnLocation');
      expect(container.specific.resourceGroupId).to.be.equal('rgId');
      expect(container.specific.tags).to.be.eql([]);
    });
  });

  it('should create a valid container definition entry', function() {
    parseVirtualNetworks(null, basicResult, function(err) {
      var containerDef = basicResult.containerDefinitions[0];
      expect(containerDef).to.be.truthy();

      expect(containerDef.id).to.be.equal('vnId');
      expect(containerDef.nativeId).to.be.equal('vnId');
      expect(containerDef.name).to.be.equal('vnName');
      expect(containerDef.type).to.be.equal('azure-vn');

      expect(containerDef.specific.resourceId).to.be.equal('vnId');
      expect(containerDef.specific.resourceName).to.be.equal('vnName');
      expect(containerDef.specific.resourceType).to.be.equal('vnType');
    });
  });

  it('its parent container(s) should have an entry in its contains arrary', function() {
    parseVirtualNetworks(null, withParentResult, function(err) {
      var parentContainer = withParentResult.topology.containers['rgId'];
      expect(parentContainer.contains).to.include('vnId');
    });
  });
});