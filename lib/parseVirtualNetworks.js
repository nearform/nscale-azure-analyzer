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
  var parseContainerDefinition = function(virtualNetwork) {
    result.containerDefinitions.push({
      id: virtualNetwork.id,
      nativeId: virtualNetwork.id,
      name: virtualNetwork.name,
      type: 'azure-vn',
      specific: {
        id: virtualNetwork.id,
        name: virtualNetwork.name,
        resourceType: virtualNetwork.type
      }
    });
  };

  var parseContainer = function(virtualNetwork) {
    result.topology.containers[virtualNetwork.id] = {
      id: virtualNetwork.id,
      nativeId: virtualNetwork.id,
      name: virtualNetwork.name,
      containedBy: null,
      containerDefinitionId: virtualNetwork.id,
      contains: [],
      type: 'azure-vn',
      specific: {
        id: virtualNetwork.id,
        name: virtualNetwork.name,
        resourceType: virtualNetwork.type,
        resourceGroupId: virtualNetwork.resourceGroupId
      }
    };
  };

  var addToParent = function(virtualNetwork) {
    var parent = _.find(azureStore.resourceGroups, function(container) {
      return container.id = virtualNetwork.resourceGroupId;
    });

    if (parent) parent.contains.push(virtualNetwork.id);
  };

  _.forEach(result.resources.virtualNetworks, function(virtualNetwork) {
    parseContainerDefinition(virtualNetwork);
    parseContainer(virtualNetwork);
    addToParent(virtualNetwork);
  });

  callback();
};