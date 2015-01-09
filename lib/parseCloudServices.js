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

module.exports = function parseCloudServices(config, result, callback) {
  var parseContainerDefinition = function(cloudService) {
    result.containerDefinitions.push({
      id: cloudService.id,
      nativeId: cloudService.id,
      name: cloudService.name,
      type: 'azure-cs',
      specific: {
        resourceId: cloudService.id,
        resourceName: cloudService.id,
        resourceType: cloudService.type
      }
    });
  };

  var parseContainer = function(cloudService) {
    result.topology.containers[cloudService.name] = {
      id: cloudService.id,
      nativeId: cloudService.id,
      name: cloudService.name,
      containedBy: null,
      containerDefinitionId: cloudService.id,
      contains: [],
      type: 'azure-cs',
      specific: {
        resourceId: cloudService.id,
        resourceName: cloudService.name,
        resourceType: cloudService.type,
        resourceGroupId: cloudService.resourceGroupId,
        virtualNetworkId: cloudService.virtualNetworkId
      }
    };
  };

  var addToParent = function(cloudService) {

  };

  _.forEach(result.resources.cloudServices, function(cloudService) {
    parseContainerDefinition(cloudService);
    parseContainer(cloudService);
    addToParent(cloudService);
  });

  callback();
};