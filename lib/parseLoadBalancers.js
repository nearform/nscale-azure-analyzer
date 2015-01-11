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

module.exports = function parseLoadBalancers(config, result, callback) {
  if (!result) return callback('missing result param');

  var parseContainerDefinition = function(loadBalancer) {
    result.containerDefinitions.push({
      id: loadBalancer.id,
      nativeId: loadBalancer.id,
      name: loadBalancer.name,
      type: 'azure-lb',
      specific: {
        resourceId: loadBalancer.id,
        resourceName: loadBalancer.name,
        resourceType: loadBalancer.type
      }
    });
  };

  var parseContainer = function(loadBalancer) {
    result.topology.containers[loadBalancer.id] = {
      id: loadBalancer.id,
      nativeId: loadBalancer.id,
      name: loadBalancer.name,
      containedBy: loadBalancer.cloudServiceId,
      containerDefinitionId: loadBalancer.id,
      contains: [],
      type: 'azure-lb',
      specific: {
        resourceId: loadBalancer.id,
        resourceName: loadBalancer.name,
        resourceType: loadBalancer.type,
        resourceLocation: loadBalancer.location,
        resourceGroupId: loadBalancer.resourceGroupId,
        virtualNetworkId: loadBalancer.virtualNetworkId,
        cloudServiceId: loadBalancer.cloudServiceId,
        tags: loadBalancer.tags
      }
    };
  };

  var addToParent = function(loadBalancer) {
    var containers = result.topology.containers;

    var parentResources = _.filter(containers, function(parentResource) {
      return parentResource.id === loadBalancer.resourceGroupId ||
        parentResource.id === loadBalancer.virtualNetworkId ||
        parentResource.id === loadBalancer.cloudServiceId;
    });

    _.forEach(parentResources, function(parentResource) {
      parentResource.contains.push(loadBalancer.id);
    });
  };

  _.forEach(result.resources.loadBalancers, function(loadBalancer) {
    parseContainerDefinition(loadBalancer);
    parseContainer(loadBalancer);
    addToParent(loadBalancer);
  });

  callback();
};