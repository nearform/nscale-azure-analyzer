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
var fs = require('fs');
var azure = require('azure');

var resourceGroupOps;
var resourceOps;
var deploymentOps;

var configureSDK = function(config) {
  credentials = new azure.CertificateCloudCredentials({
    subscriptionId: config.subscriptionId,
    pem: fs.readFileSync(config.pemPath.toString()).toString()
  });

  var resourceClient = azure.createResourceManagementClient(credentials);
  resourceGroupOps = resourceClient.resourceGroups;
  resourceOps = resourceClient.resources;
  deploymentOps = resourceClient.deployments;

}

module.exports = function fetchAzureData(config, result, callback) {
  configureSDK(config);

  result.resources = {
    resourceGroups: [],
    virtualNetworks: [],
    cloudServices: [],
    loadBalancers: [],
    virtualMachines: []
  };

  callback();
};