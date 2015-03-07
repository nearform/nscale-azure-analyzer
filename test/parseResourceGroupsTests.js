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

var parseResourceGroups = require('../lib/parseResourceGroups.js');

describe('parseResourceGroups.js:', function() {
  var emptyResult;
  var basicResult;

  beforeEach(function() {
    emptyResult = {
      containerDefinitions: [],
      topology: {
        containers: {}
      },
      resources: {
        resourceGroups: []
      }
    };

    basicResult = _.cloneDeep(emptyResult);
    basicResult.resources.resourceGroups.push({
      id: 'rgId',
      name: 'rgName',
      type: 'rgType',
      location: 'rgLocation',
      tags: []
    });
  });

  it('should err on missing result', function(done) {
    parseResourceGroups(null, null, function(err) {
      expect(err).to.be.truthy();

      done();
    });
  });

  it('should not err with valid result', function(done) {
    parseResourceGroups(null, emptyResult, function(err) {
      expect(err).to.be.falsy();

      done();
    });
  });

  it('should not modify result unless there is data to do so', function(done) {
    var initialResult = _.cloneDeep(emptyResult);
    parseResourceGroups(null, emptyResult, function(err) {
      expect(err).to.be.null();
      expect(emptyResult).to.be.eql(initialResult);

      done();
    });
  });

  it('should create a valid container entry', function(done) {
    parseResourceGroups(null, basicResult, function(err) {
      expect(err).to.be.null();

      var container = basicResult.topology.containers.rgId;
      expect(container).to.be.truthy();

      expect(container.id).to.be.equal('rgId');
      expect(container.nativeId).to.be.equal('rgId');
      expect(container.name).to.be.equal('rgName');
      expect(container.containedBy).to.be.equal(null);
      expect(container.containerDefinitionId).to.be.equal('rgId');
      expect(container.contains).to.be.eql([]);
      expect(container.type).to.be.equal('azure-rg');

      expect(container.specific.resourceId).to.be.equal('rgId');
      expect(container.specific.resourceName).to.be.equal('rgName');
      expect(container.specific.resourceType).to.be.equal('rgType');
      expect(container.specific.resourceLocation).to.be.equal('rgLocation');
      expect(container.specific.tags).to.be.eql([]);

      done();
    });
  });

  it('should create a valid container definition entry', function(done) {
    parseResourceGroups(null, basicResult, function(err) {
      expect(err).to.be.null();

      var containerDef = basicResult.containerDefinitions[0];
      expect(containerDef).to.be.truthy();

      expect(containerDef.id).to.be.equal('rgId');
      expect(containerDef.nativeId).to.be.equal('rgId');
      expect(containerDef.name).to.be.equal('rgName');
      expect(containerDef.type).to.be.equal('azure-rg');

      expect(containerDef.specific.resourceId).to.be.equal('rgId');
      expect(containerDef.specific.resourceName).to.be.equal('rgName');
      expect(containerDef.specific.resourceType).to.be.equal('rgType');

      done();
    });
  });
});
