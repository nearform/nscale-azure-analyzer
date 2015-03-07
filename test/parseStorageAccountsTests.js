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
    withParentResult.topology.containers.rgId = {
      id: 'rgId',
      contains: [],
    };
  });

  it('should err on missing result', function(done) {
    parseStorageAccounts(null, null, function(err) {
      expect(err).to.be.truthy();

      done();
    });
  });

  it('should not err with valid result', function(done) {
    parseStorageAccounts(null, emptyResult, function(err) {
      expect(err).to.be.falsy();

      done();
    });
  });

  it('should not modify result unless there is data to do so', function(done) {
    var initialResult = _.cloneDeep(emptyResult);
    parseStorageAccounts(null, emptyResult, function(err) {
      expect(err).to.be.null();
      expect(emptyResult).to.be.eql(initialResult);

      done();
    });
  });

  it('should create a valid container entry', function(done) {
    parseStorageAccounts(null, basicResult, function(err) {
      expect(err).to.null();

      var container = basicResult.topology.containers.saId;
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

      done();
    });
  });

  it('should create a valid container definition entry', function(done) {
    parseStorageAccounts(null, basicResult, function(err) {
      expect(err).to.be.null();

      var containerDef = basicResult.containerDefinitions[0];
      expect(containerDef).to.be.truthy();

      expect(containerDef.id).to.be.equal('saId');
      expect(containerDef.nativeId).to.be.equal('saId');
      expect(containerDef.name).to.be.equal('saName');
      expect(containerDef.type).to.be.equal('azure-sa');

      expect(containerDef.specific.resourceId).to.be.equal('saId');
      expect(containerDef.specific.resourceName).to.be.equal('saName');
      expect(containerDef.specific.resourceType).to.be.equal('saType');

      done();
    });
  });

  it('its parent container(s) should have an entry in its contains arrary', function(done) {
    parseStorageAccounts(null, withParentResult, function(err) {
      expect(err).to.be.null();

      var parentContainer = withParentResult.topology.containers.rgId;
      expect(parentContainer.contains).to.include('saId');

      done();
    });
  });
});
