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

module.exports = function parseVirtualMachines(config, result, callback) {
  var parseContainerDefinition = function(virtualMachine) {
    result.containerDefinitions.push({
      id: virtualMachine.imageId,
      nativeId: virtualMachine.imageId,
      name: virtualMachine.name,
      type: 'azure-vm',
      specific: {
        resourceId: virtualMachine.imageId,
        resourceName: virtualMachine.name,
        resourceType: virtualMachine.type
      }
    });
  };

  var parseContainer = function(virtualMachine) {
    result.topology.containers[virtualMachine.id] = {
      id: virtualMachine.id,
      nativeId: virtualMachine.id,
      name: virtualMachine.name,
      containedBy: virtualMachine.loadBalancerId || virtualMachine.cloudServiceId,
      containerDefinitionId: virtualMachine.id,
      contains: [],
      type: 'azure-vm',
      specific: {
        publicIpAddress: virtualMachine.publicIpAddress,
        privateIpAddress: virtualMachine.privateIpAddress,
        imageId: virtualMachine.imageId,
        imageUri: virtualMachine.imageUri,
        resourceId: virtualMachine.id,
        resourceName: virtualMachine.name,
        resourceType: virtualMachine.type,
        resourceLocation: virtualMachine.location,
        resourceGroupId: virtualMachine.resourceGroupId,
        virtualNetworkId: virtualMachine.virtualNetworkId,
        storageAccountId: virtualMachine.storageAccountId,
        cloudServiceId: virtualMachine.cloudServiceId,
        loadBalancerId: virtualMachine.loadBalancerId
      }
    };
  };

  var addToParent = function(virtualMachine, result) {
    var containers = result.topology.containers;

    var resourceGroup = _.findWhere(containers, function(resourceGroup) {
      return resourceGroup.id === virtualMachine.resourceGroupId;
    });
    if (resourceGroup) resourceGroup.contains.push(virtualMachine.id);

    var storageAccount = _.findWhere(containers, function(storageAccount) {
      return storageAccount.id === virtualMachine.storageAccountId;
    });
    if (storageAccount) storageAccount.contains.push(virtualMachine.id);

    var virtualNetwork = _.findWhere(containers, function(virtualNetwork) {
      return virtualNetwork.id === virtualMachine.virtualNetworkId;
    });
    if (virtualNetwork) virtualNetwork.contains.push(virtualMachine.id);

    var cloudService = _.findWhere(containers, function(cloudService) {
      return cloudService.id === virtualMachine.cloudServiceId;
    });
    if (cloudService) cloudService.contains.push(virtualMachine.id);

    var loadBalancer = _.findWhere(containers, function(loadBalancer) {
      return loadBalancer.id === virtualMachine.loadBalancerId;
    });
    if (loadBalancer) loadBalancer.contains.push(virtualMachine.id);
  };

  _.forEach(result.resources.virtualMachines, function(virtualMachine) {
    parseContainerDefinition(virtualMachine);
    parseContainer(virtualMachine);
    addToParent(virtualMachine, result);
  });

  callback();
};