'use strict';

var expect = require('must');
var _ = require('lodash');

var parseCloudServices = require('../lib/parseCloudServices.js');

describe('parseCloudServices.js:', function() {
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
        cloudServices: []
      }
    };

    basicResult = _.cloneDeep(emptyResult);
    basicResult.resources.cloudServices.push({
      id: 'csId',
      name: 'csName',
      type: 'csType',
      location: 'csLocation',
      resourceGroupId: 'rgId',
      virtualNetworkId: 'vnId',
      tags: []
    });

    withParentResult = _.cloneDeep(basicResult);
    withParentResult.topology.containers['rgId'] = {
      id: 'rgId',
      contains: [],
    };
    withParentResult.topology.containers['vnId'] = {
      id: 'vnId',
      contains: [],
    }
  });

  it('should err on missing result', function() {
    parseCloudServices(null, null, function(err) {
      expect(err).to.be.truthy();
    });
  });

  it('should not err with valid result', function() {
    parseCloudServices(null, emptyResult, function(err) {
      expect(err).to.be.falsy();
    });
  });

  it('should not modify result unless there is data to do so', function() {
    var initialResult = _.cloneDeep(emptyResult);
    parseCloudServices(null, emptyResult, function(err) {
      expect(emptyResult).to.be.eql(initialResult);
    });
  });

  it('should create a valid container entry', function() {
    parseCloudServices(null, basicResult, function(err) {
      var container = basicResult.topology.containers['csId'];
      expect(container).to.be.truthy();

      expect(container.id).to.be.equal('csId');
      expect(container.nativeId).to.be.equal('csId');
      expect(container.name).to.be.equal('csName');
      expect(container.containedBy).to.be.equal('vnId');
      expect(container.containerDefinitionId).to.be.equal('csId');
      expect(container.contains).to.be.eql([]);
      expect(container.type).to.be.equal('azure-cs');

      expect(container.specific.resourceId).to.be.equal('csId');
      expect(container.specific.resourceName).to.be.equal('csName');
      expect(container.specific.resourceType).to.be.equal('csType');
      expect(container.specific.resourceLocation).to.be.equal('csLocation');
      expect(container.specific.resourceGroupId).to.be.equal('rgId');
      expect(container.specific.virtualNetworkId).to.be.equal('vnId');
      expect(container.specific.tags).to.be.eql([]);
    });
  });

  it('should create a valid container definition entry', function() {
    parseCloudServices(null, basicResult, function(err) {
      var containerDef = basicResult.containerDefinitions[0];
      expect(containerDef).to.be.truthy();

      expect(containerDef.id).to.be.equal('csId');
      expect(containerDef.nativeId).to.be.equal('csId');
      expect(containerDef.name).to.be.equal('csName');
      expect(containerDef.type).to.be.equal('azure-cs');

      expect(containerDef.specific.resourceId).to.be.equal('csId');
      expect(containerDef.specific.resourceName).to.be.equal('csName');
      expect(containerDef.specific.resourceType).to.be.equal('csType');
    });
  });

  it('its parent container(s) should have an entry in its contains arrary', function() {
    parseCloudServices(null, withParentResult, function(err) {
      var parentContainers = [
        withParentResult.topology.containers['rgId'],
        withParentResult.topology.containers['vnId']
      ];

      _.forEach(parentContainers, function(parentContainer) {
        expect(parentContainer.contains).to.include('csId');
      });
    });
  });
});