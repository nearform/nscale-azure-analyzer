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
    withParentResult.topology.containers.rgId = {
      id: 'rgId',
      contains: [],
    };
    withParentResult.topology.containers.vnId = {
      id: 'vnId',
      contains: [],
    };
    withParentResult.topology.containers.csId = {
      id: 'csId',
      contains: [],
    };
  });

  it('should err on missing result', function(done) {
    parseLoadBalancers(null, null, function(err) {
      expect(err).to.be.truthy();

      done();
    });
  });

  it('should not err with valid result', function(done) {
    parseLoadBalancers(null, emptyResult, function(err) {
      expect(err).to.be.falsy();

      done();
    });
  });

  it('should not modify result unless there is data to do so', function(done) {
    var initialResult = _.cloneDeep(emptyResult);
    parseLoadBalancers(null, emptyResult, function(err) {
      expect(err).to.be.null();
      expect(emptyResult).to.be.eql(initialResult);

      done();
    });
  });

  it('should create a valid container entry', function(done) {
    parseLoadBalancers(null, basicResult, function(err) {
      expect(err).to.be.null();

      var container = basicResult.topology.containers.lbId;
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

      done();
    });
  });

  it('should create a valid container definition entry', function(done) {
    parseLoadBalancers(null, basicResult, function(err) {
      expect(err).to.be.null();

      var containerDef = basicResult.containerDefinitions[0];
      expect(containerDef).to.be.truthy();

      expect(containerDef.id).to.be.equal('lbId');
      expect(containerDef.nativeId).to.be.equal('lbId');
      expect(containerDef.name).to.be.equal('lbName');
      expect(containerDef.type).to.be.equal('azure-lb');

      expect(containerDef.specific.resourceId).to.be.equal('lbId');
      expect(containerDef.specific.resourceName).to.be.equal('lbName');
      expect(containerDef.specific.resourceType).to.be.equal('lbType');

      done();
    });
  });

  it('its parent container(s) should have an entry in its contains arrary', function(done) {
    parseLoadBalancers(null, withParentResult, function(err) {
      expect(err).to.be.null();

      var parentContainers = [
        withParentResult.topology.containers.rgId,
        withParentResult.topology.containers.vnId,
        withParentResult.topology.containers.csId
      ];

      _.forEach(parentContainers, function(parentContainer) {
        expect(parentContainer.contains).to.include('lbId');
      });

      done();
    });
  });
});
