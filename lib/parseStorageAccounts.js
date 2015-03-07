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

var _ = require('lodash');

module.exports = function parseStorageAccounts(config, result, callback) {
  if (!result) { return callback('missing result param'); }

  var parseContainerDefinition = function(storageAccount, result) {
    result.containerDefinitions.push({
      id: storageAccount.id,
      nativeId: storageAccount.id,
      name: storageAccount.name,
      type: 'azure-sa',
      specific: {
        resourceId: storageAccount.id,
        resourceName: storageAccount.name,
        resourceType: storageAccount.type
      }
    });
  };

  var parseContainer = function(storageAccount, result) {
    result.topology.containers[storageAccount.id] = {
      id: storageAccount.id,
      nativeId: storageAccount.id,
      name: storageAccount.name,
      containedBy: storageAccount.resourceGroupId,
      containerDefinitionId: storageAccount.id,
      contains: [],
      type: 'azure-sa',
      specific: {
        resourceId: storageAccount.id,
        resourceName: storageAccount.name,
        resourceType: storageAccount.type,
        resourceLocation: storageAccount.location,
        resourceGroupId: storageAccount.resourceGroupId,
        tags: storageAccount.tags
      }
    };
  };

  var addToParent = function(storageAccount, result) {
    var containers = result.topology.containers;
    var parentResources = _.filter(containers, function(parentResource) {
      return parentResource.id === storageAccount.resourceGroupId;
    });

    _.forEach(parentResources, function(parentResource) {
      parentResource.contains.push(storageAccount.id);
    });
  };

  _.forEach(result.resources.storageAccounts, function(storageAccount) {
    parseContainerDefinition(storageAccount, result);
    parseContainer(storageAccount, result);
    addToParent(storageAccount, result);
  });

  callback(null);
};
