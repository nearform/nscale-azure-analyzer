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
var async = require('async');
var azure = require('azure');
var tokenService = require('adal-node').AuthenticationContext;

var resourceGroupOps;
var resourceOps;
var deploymentOps;

var generateAuthToken = function(azureConfig, callback) {
  var authorityUrl = azureConfig.authorityUrl + '/' + azureConfig.tenantId;
  var service = new tokenService(authorityUrl);

  var done = function(err, response) {
    if (err) return callback(err);

    azureConfig.token = response.accessToken;
    callback();
  };

  service.acquireTokenWithUsernamePassword(
    'https://management.core.windows.net/',
    azureConfig.username,
    azureConfig.password,
    azureConfig.clientId,
    done);
};

var configureSDK = function(config, result, callback) {
  var azureConfig = config.azureConfig;
  if (!azureConfig) {
    callback('Missing config.AzureConfig');
  }

  generateAuthToken(azureConfig, function(err) {
    if (err) {
      callback(err);
    }

    var credentials = new azure.TokenCloudCredentials({
      subscriptionId: azureConfig.subscriptionId,
      token: azureConfig.token
    });

    var resourceClient = azure.createResourceManagementClient(credentials);
    resourceGroupOps = resourceClient.resourceGroups;
    resourceOps = resourceClient.resources;
    deploymentOps = resourceClient.deployments;

    callback();
  });
};

var fetchResourceGroupData = function(config, result, callback) {
  resourceGroupOps.list(function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
    callback();
  });
};

module.exports = function fetchAzureData(config, result, callback) {
  var series = [
  configureSDK,
  fetchResourceGroupData
  ];

  var onNext = function(func, done) {
    func(config, result, done);
  };

  result.resources = {
    resourceGroups: [],
    virtualNetworks: [],
    cloudServices: [],
    loadBalancers: [],
    virtualMachines: []
  };

  async.eachSeries(series, onNext, callback);
};