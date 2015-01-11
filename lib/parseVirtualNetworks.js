/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
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

var _ = require('lodash');

module.exports = function parseVirtualNetworks(config, result, callback) {
  if (!result) return callback('missing result param');

  var parseContainerDefinition = function(virtualNetwork) {
    result.containerDefinitions.push({
      id: virtualNetwork.id,
      nativeId: virtualNetwork.id,
      name: virtualNetwork.name,
      type: 'azure-vn',
      specific: {
        resourceId: virtualNetwork.id,
        resourceName: virtualNetwork.name,
        resourceType: virtualNetwork.type
      }
    });
  };

  var parseContainer = function(virtualNetwork) {
    result.topology.containers[virtualNetwork.id] = {
      id: virtualNetwork.id,
      nativeId: virtualNetwork.id,
      name: virtualNetwork.name,
      containedBy: virtualNetwork.resourceGroupId,
      containerDefinitionId: virtualNetwork.id,
      contains: [],
      type: 'azure-vn',
      specific: {
        resourceId: virtualNetwork.id,
        resourceName: virtualNetwork.name,
        resourceType: virtualNetwork.type,
        resourceLocation: virtualNetwork.location,
        resourceGroupId: virtualNetwork.resourceGroupId,
        tags: virtualNetwork.tags
      }
    };
  };

  var addToParent = function(virtualNetwork, result) {
    var containers = result.topology.containers;
    var parentResources = _.filter(containers, function(parentResource) {
      return parentResource.id === virtualNetwork.resourceGroupId;
    });

    _.forEach(parentResources, function(parentResource) {
      parentResource.contains.push(virtualNetwork.id);
    });
  };

  _.forEach(result.resources.virtualNetworks, function(virtualNetwork) {
    parseContainerDefinition(virtualNetwork, result);
    parseContainer(virtualNetwork, result);
    addToParent(virtualNetwork, result);
  });

  callback();
};