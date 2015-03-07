/*
 * THIS SOFTWARE IS PROVIDED 'AS IS' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var expect = require('must');
var _ = require('lodash');

var parseVirtualMachines = require('../lib/parseVirtualMachines.js');

describe('parseVirtualMachines.js:', function() {
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
        virtualMachines: []
      }
    };

    basicResult = _.cloneDeep(emptyResult);
    basicResult.resources.virtualMachines.push({
      id: 'vmId',
      name: 'vmName',
      type: 'vmType',
      location: 'vmLocation',
      imageId: 'imgId',
      imageUri: 'imgUri',
      publicIpAddress: '1.2.3.4',
      privateIpAddress: '5.6.7.8',
      resourceGroupId: 'rgId',
      virtualNetworkId: 'vnId',
      cloudServiceId: 'csId',
      loadBalancerId: 'lbId',
      storageAccountId: 'saId',
      tags: []
    });

    var parents = [
    'rgId',
    'saId',
    'vnId',
    'csId',
    'lbId'
    ];

    withParentResult = _.cloneDeep(basicResult);
    _.forEach(parents, function(parent) {
      withParentResult.topology.containers[parent] = {
        id: parent,
        contains: [],
      };
    });
  });

  it('should err on missing result', function(done) {
    parseVirtualMachines(null, null, function(err) {
      expect(err).to.be.truthy();

      done();
    });
  });

  it('should not err with valid result', function(done) {
    parseVirtualMachines(null, emptyResult, function(err) {
      expect(err).to.be.null();

      done();
    });
  });

  it('should not modify result unless there is data to do so', function(done) {
    var initialResult = _.cloneDeep(emptyResult);
    parseVirtualMachines(null, emptyResult, function(err) {
      expect(err).to.be.null();

      expect(emptyResult).to.be.eql(initialResult);

      done();
    });
  });

  it('should create a valid container entry', function(done) {
    parseVirtualMachines(null, basicResult, function(err) {
      expect(err).to.be.null();

      var container = basicResult.topology.containers.vmId;
      expect(container).to.be.truthy();

      expect(container.id).to.be.equal('vmId');
      expect(container.nativeId).to.be.equal('vmId');
      expect(container.name).to.be.equal('vmName');
      expect(container.containedBy).to.be.equal('lbId');
      expect(container.containerDefinitionId).to.be.equal('imgId');
      expect(container.contains).to.be.eql([]);
      expect(container.type).to.be.equal('azure-vm');

      expect(container.specific.imageId).to.be.equal('imgId');
      expect(container.specific.imageUri).to.be.equal('imgUri');
      expect(container.specific.publicIpAddress).to.be.equal('1.2.3.4');
      expect(container.specific.privateIpAddress).to.be.equal('5.6.7.8');

      expect(container.specific.resourceId).to.be.equal('vmId');
      expect(container.specific.resourceName).to.be.equal('vmName');
      expect(container.specific.resourceType).to.be.equal('vmType');
      expect(container.specific.resourceLocation).to.be.equal('vmLocation');
      expect(container.specific.resourceGroupId).to.be.equal('rgId');
      expect(container.specific.virtualNetworkId).to.be.equal('vnId');
      expect(container.specific.cloudServiceId).to.be.equal('csId');
      expect(container.specific.loadBalancerId).to.be.equal('lbId');
      expect(container.specific.storageAccountId).to.be.equal('saId');
      expect(container.specific.tags).to.be.eql([]);

      done();
    });
  });

  it('should create a valid container definition entry', function(done) {
    parseVirtualMachines(null, basicResult, function(err) {
      expect(err).to.be.null();

      var containerDef = basicResult.containerDefinitions[0];
      expect(containerDef).to.be.truthy();

      expect(containerDef.id).to.be.equal('imgId');
      expect(containerDef.nativeId).to.be.equal('imgId');
      expect(containerDef.name).to.be.equal('vmName');
      expect(containerDef.type).to.be.equal('azure-vm');

      expect(containerDef.specific.resourceId).to.be.equal('imgId');
      expect(containerDef.specific.resourceName).to.be.equal('vmName');
      expect(containerDef.specific.resourceType).to.be.equal('vmType');

      done();
    });
  });

  it('its parent container(s) should have an entry in its contains array', function(done) {
    parseVirtualMachines(null, withParentResult, function(err) {
      expect(err).to.be.null();

      var parentContainers = [
        withParentResult.topology.containers.rgId,
        withParentResult.topology.containers.saId,
        withParentResult.topology.containers.vnId,
        withParentResult.topology.containers.csId,
        withParentResult.topology.containers.lbId
      ];

      _.forEach(parentContainers, function(parentContainer) {
        expect(parentContainer.contains).to.include('vmId');
      });

      done();
    });
  });

  it('its parent should be a cloud service if no loadBalancer is found', function(done) {
    delete withParentResult.topology.containers.lbId;
    delete withParentResult.resources.virtualMachines[0].loadBalancerId;

    parseVirtualMachines(null, withParentResult, function(err) {
      expect(err).to.be.null();

      var container = withParentResult.topology.containers.vmId;
      expect(container.containedBy).to.be.equal('csId');

      done();
    });
  });
});
