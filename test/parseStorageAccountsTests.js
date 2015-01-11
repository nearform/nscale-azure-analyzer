'use strict';

var expect = require('must');
var _ = require('lodash');

var parseStorageAccounts = require('../lib/parseStorageAccounts.js');

describe('parseStorageAccounts.js:', function() {
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
        storageAccounts: []
      }
    };

    basicResult = _.cloneDeep(emptyResult);
    basicResult.resources.storageAccounts.push({
      id: 'saId',
      name: 'saName',
      type: 'saType',
      location: 'saLocation',
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
    parseStorageAccounts(null, null, function(err) {
      expect(err).to.be.truthy();
    });
  });

  it('should not err with valid result', function() {
    parseStorageAccounts(null, emptyResult, function(err) {
      expect(err).to.be.falsy();
    });
  });

  it('should not modify result unless there is data to do so', function() {
    var initialResult = _.cloneDeep(emptyResult);
    parseStorageAccounts(null, emptyResult, function(err) {
      expect(emptyResult).to.be.eql(initialResult);
    });
  });

  it('should create a valid container entry', function() {
    parseStorageAccounts(null, basicResult, function(err) {
      var container = basicResult.topology.containers['saId'];
      expect(container).to.be.truthy();

      expect(container.id).to.be.equal('saId');
      expect(container.nativeId).to.be.equal('saId');
      expect(container.name).to.be.equal('saName');
      expect(container.containedBy).to.be.equal('rgId');
      expect(container.containerDefinitionId).to.be.equal('saId');
      expect(container.contains).to.be.eql([]);
      expect(container.type).to.be.equal('azure-sa');

      expect(container.specific.resourceId).to.be.equal('saId');
      expect(container.specific.resourceName).to.be.equal('saName');
      expect(container.specific.resourceType).to.be.equal('saType');
      expect(container.specific.resourceLocation).to.be.equal('saLocation');
      expect(container.specific.resourceGroupId).to.be.equal('rgId');
      expect(container.specific.tags).to.be.eql([]);
    });
  });

  it('should create a valid container definition entry', function() {
    parseStorageAccounts(null, basicResult, function(err) {
      var containerDef = basicResult.containerDefinitions[0];
      expect(containerDef).to.be.truthy();

      expect(containerDef.id).to.be.equal('saId');
      expect(containerDef.nativeId).to.be.equal('saId');
      expect(containerDef.name).to.be.equal('saName');
      expect(containerDef.type).to.be.equal('azure-sa');

      expect(containerDef.specific.resourceId).to.be.equal('saId');
      expect(containerDef.specific.resourceName).to.be.equal('saName');
      expect(containerDef.specific.resourceType).to.be.equal('saType');
    });
  });

  it('its parent container(s) should have an entry in its contains arrary', function() {
    parseStorageAccounts(null, withParentResult, function(err) {
      var parentContainer = withParentResult.topology.containers['rgId'];
      expect(parentContainer.contains).to.include('saId');
    });
  });
});