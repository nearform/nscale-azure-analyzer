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

module.exports = function parseResourceGroups(config, result, callback) {
  var parseContainerDefinition = function(resourceGroup, result) {
    result.containerDefinitions.push({
      id: resourceGroup.id,
      nativeId: resourceGroup.id,
      name: resourceGroup.name,
      type: 'azure-rg',
      specific: {
        id: resourceGroup.id,
        name: resourceGroup.name,
        resourceType: resourceGroup.type
      }
    });
  };

  var parseContainer = function(resourceGroup, result) {
    result.topology.containers[resourceGroup.id] = {
      id: resourceGroup.id,
      nativeId: resourceGroup.id,
      name: resourceGroup.name,
      containedBy: null,
      containerDefinitionId: resourceGroup.id,
      contains: [],
      type: 'azure-rg',
      specific: {
        id: resourceGroup.id,
        name: resourceGroup.name,
        resourceType: resourceGroup.type
      }
    };
  };

  _.forEach(result.resources.resourceGroups, function(resourceGroup) {
    parseContainerDefinition(resourceGroup, result);
    parseContainer(resourceGroup, result);
  });

  callback();
};