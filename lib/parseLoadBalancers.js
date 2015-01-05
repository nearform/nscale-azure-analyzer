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
var azureStore = require('./azureStore.js');

module.exports = function parseLoadBalancers(config, result, callback) {
  var parseContainerDefinition = function(loadBalancer) {
    result.containerDefinitions.push({
      id: loadBalancer.id,
      nativeId: loadBalancer.id,
      name: loadBalancer.name,
      type: 'azure-lb',
      specific: {
        id: loadBalancer.id,
        name: loadBalancer.name,
        resourceType: loadBalancer.type
      }
    });
  };

  var parseContainer = function(loadBalancer) {
    result.topology.containers[loadBalancer.id] = {
      id: loadBalancer.id,
      nativeId: loadBalancer.id,
      name: loadBalancer.name,
      containedBy: null,
      containerDefinitionId: loadBalancer.id,
      contains: [],
      type: 'azure-lb',
      specific: {
        id: loadBalancer.id,
        name: loadBalancer.name,
        resourceType: loadBalancer.type,
        resourceGroupId: loadBalancer.resourceGroupId,
        virtualNetworkId: loadBalancer.virtualNetworkId,
        cloudServiceId: loadBalancer.cloudServiceId
      }
    };
  };

  var addToParent = function(loadBalancer) {
    var parent = _.find(azureStore.cloudServices, function(container)) {
      return container.id === loadBalancer.cloudServiceId;
    }

    if (parent) parent.contains.push(loadBalancer.id);
  };

  _.forEach(azureStore.loadBalancers, function(loadBalancer) {
    parseContainerDefinition(loadBalancer);
    parseContainer(loadBalancer);
    addToParent(loadBalancer);
  });

  callback();
};