'use strict';

var expect = require('must');
var _ = require('lodash');

var parseLoadBalancers = require('../lib/parseLoadBalancers.js');

describe('parseLoadBalancers.js:', function() {
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
        loadBalancers: []
      }
    };

    basicResult = _.cloneDeep(emptyResult);
    basicResult.resources.loadBalancers.push({
      id: 'lbId',
      name: 'lbName',
      type: 'lbType',
      location: 'lbLocation',
      resourceGroupId: 'rgId',
      virtualNetworkId: 'vnId',
      cloudServiceId: 'csId',
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
    };
    withParentResult.topology.containers['csId'] = {
      id: 'csId',
      contains: [],
    };
  });

  it('should err on missing result', function() {
    parseLoadBalancers(null, null, function(err) {
      expect(err).to.be.truthy();
    });
  });

  it('should not err with valid result', function() {
    parseLoadBalancers(null, emptyResult, function(err) {
      expect(err).to.be.falsy();
    });
  });

  it('should not modify result unless there is data to do so', function() {
    var initialResult = _.cloneDeep(emptyResult);
    parseLoadBalancers(null, emptyResult, function(err) {
      expect(emptyResult).to.be.eql(initialResult);
    });
  });

  it('should create a valid container entry', function() {
    parseLoadBalancers(null, basicResult, function(err) {
      var container = basicResult.topology.containers['lbId'];
      expect(container).to.be.truthy();

      expect(container.id).to.be.equal('lbId');
      expect(container.nativeId).to.be.equal('lbId');
      expect(container.name).to.be.equal('lbName');
      expect(container.containedBy).to.be.equal('csId');
      expect(container.containerDefinitionId).to.be.equal('lbId');
      expect(container.contains).to.be.eql([]);
      expect(container.type).to.be.equal('azure-lb');

      expect(container.specific.resourceId).to.be.equal('lbId');
      expect(container.specific.resourceName).to.be.equal('lbName');
      expect(container.specific.resourceType).to.be.equal('lbType');
      expect(container.specific.resourceLocation).to.be.equal('lbLocation');
      expect(container.specific.resourceGroupId).to.be.equal('rgId');
      expect(container.specific.virtualNetworkId).to.be.equal('vnId');
      expect(container.specific.cloudServiceId).to.be.equal('csId');
      expect(container.specific.tags).to.be.eql([]);
    });
  });

  it('should create a valid container definition entry', function() {
    parseLoadBalancers(null, basicResult, function(err) {
      var containerDef = basicResult.containerDefinitions[0];
      expect(containerDef).to.be.truthy();

      expect(containerDef.id).to.be.equal('lbId');
      expect(containerDef.nativeId).to.be.equal('lbId');
      expect(containerDef.name).to.be.equal('lbName');
      expect(containerDef.type).to.be.equal('azure-lb');

      expect(containerDef.specific.resourceId).to.be.equal('lbId');
      expect(containerDef.specific.resourceName).to.be.equal('lbName');
      expect(containerDef.specific.resourceType).to.be.equal('lbType');
    });
  });

  it('its parent container(s) should have an entry in its contains arrary', function() {
    parseLoadBalancers(null, withParentResult, function(err) {
      var parentContainers = [
        withParentResult.topology.containers['rgId'],
        withParentResult.topology.containers['vnId'],
        withParentResult.topology.containers['csId']
      ];

      _.forEach(parentContainers, function(parentContainer) {
        expect(parentContainer.contains).to.include('lbId');
      });
    });
  });
});