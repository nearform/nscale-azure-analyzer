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

var shortenId = function(type, name) {
  return type + '/' + name;
};

var configureSDK = function(config, result, callback) {
  if (!config.azureConfig) return callback('Missing config.azureConfig');

  var generateAuthToken = function(azureConfig, complete) {
    var authorityUrl = azureConfig.authorityUrl + '/' + azureConfig.tenantId;
    var service = new tokenService(authorityUrl);

    var done = function(err, response) {
      if (err) return complete(err);
      azureConfig.token = response.accessToken;
      complete();
    }

    service.acquireTokenWithUsernamePassword(
      'https://management.core.windows.net/',
      azureConfig.username,
      azureConfig.password,
      azureConfig.clientId,
      done);
  };

  var azureConfig = config.azureConfig;

  generateAuthToken(azureConfig, function(err) {
    if (err) return callback(err);

    var credentials = new azure.TokenCloudCredentials({
      subscriptionId: azureConfig.subscriptionId,
      token: azureConfig.token
    });

    var resourceClient = azure.createResourceManagementClient(credentials);
    resourceGroupOps = resourceClient.resourceGroups;
    resourceOps = resourceClient.resources;

    callback();
  });
};

var fetchResourceGroupData = function(config, result, callback) {
  var tags = {
    tagName: 'nscale-system',
    tagValue: config.name
  };

  resourceGroupOps.list(tags, function(err, data) {
    if (err) return callback(err);

    var resourceGroupType = 'Microsoft.Classic/resourceGroups';

    _.forEach(data.resourceGroups, function(resourceGroup) {
      result.resources.resourceGroups.push({
        id: shortenId(resourceGroupType, resourceGroup.name),
        name: resourceGroup.name,
        type: resourceGroupType,
        location: resourceGroup.location,
        tags: resourceGroup.tags
      });
    });

    callback();
  });
};

var fetchResourcesData = function(config, result, callback) {
  resourceOps.list(function(err, data) {
    if (err) return callback(err);

    var resources = result.resources;
    var resourceGroups = resources.resourceGroups;

    _.forEach(data.resources, function(resource) {
      var resourceGroup = _.findWhere(resources.resourceGroups, function(group) {
        return new RegExp(group.name).test(resource.id);
      });

      if (resourceGroup) {
        var resourceData = {
          id: shortenId(resource.type, resource.name),
          name: resource.name,
          location: resource.location,
          type: resource.type,
          tags: resource.tags,
          resourceGroupId: resourceGroup.id,
        };

        var id = resourceData.id;
        var storageAccounts = resources.storageAccounts;
        var virtualNetworks = resources.virtualNetworks;
        var cloudServices = resources.cloudServices;
        var loadBalancers = resources.loadBalancers;
        var virtualMachines = resources.virtualMachines;

        if (/storageAccounts/.test(id)) storageAccounts.push(resourceData);
        if (/virtualNetworks/.test(id)) virtualNetworks.push(resourceData);
        if (/domainNames/.test(id)) cloudServices.push(resourceData);
        if (/loadBalancers/.test(id)) loadBalancers.push(resourceData);
        if (/virtualMachines/.test(id)) virtualMachines.push(resourceData);
      }
    });
    callback();
  });
};

var fetchCloudServicesData = function(config, result, callback) {
  var cloudServices = result.resources.cloudServices;

  _.forEach(cloudServices, function(cloudService) {
    var virtualNetworks = result.resources.virtualNetworks;
    var virtualNetwork = _.findWhere(virtualNetworks, function(virtualNetwork) {
      return virtualNetwork.resourceGroupId === cloudService.resourceGroupId;
    });

    if (virtualNetwork) {
      cloudService.virtualNetworkId = virtualNetwork.id;
    }
  });

  callback();
};

var fetchVirtualMachineData = function(config, result, callback) {
  var onNext = function(virtualMachine, done) {
    var resourceIdentity = {
      resourceName: virtualMachine.name,
      resourceProviderApiVersion: '2014-04-01',
      resourceProviderNamespace: 'Microsoft.ClassicCompute',
      resourceType: 'virtualMachines'
    }

    var resourceGroups = result.resources.resourceGroups;
    var resourceGroup = _.findWhere(resourceGroups, function(resourceGroup) {
      return resourceGroup.id === virtualMachine.resourceGroupId;
    });

    resourceOps.get(resourceGroup.name, resourceIdentity, function(err, data) {
      if (err) return done(err);

      var resource = data.resource;
      virtualMachine.tags = resource.tags;

      var ipAddresses = resource.properties.instanceView;
      virtualMachine.privateIpAddress = ipAddresses.privateIpAddress;
      virtualMachine.publicIpAddress = ipAddresses.publicIpAddresses[0];

      var cloudService = resource.properties.domainName;
      virtualMachine.cloudServiceId = shortenId(cloudService.type, cloudService.name);

      var virtualNetwork = resource.properties.networkProfile.virtualNetwork;
      virtualMachine.virtualNetworkId = shortenId(virtualNetwork.type, virtualNetwork.name);

      var diskData = resource.properties.storageProfile.operatingSystemDisk;
      virtualMachine.imageId = diskData.sourceImageName;
      virtualMachine.imageUri = diskData.vhdUri;

      var storageAccount = diskData.storageAccount;
      virtualMachine.storageAccountId = shortenId(storageAccount.type, storageAccount.name);

      done();
    });
  };

  var virtualMachines = result.resources.virtualMachines;

  async.eachSeries(virtualMachines, onNext, callback);
};

module.exports = function fetchAzureData(config, result, callback) {
  var series = [
  configureSDK,
  fetchResourceGroupData,
  fetchResourcesData,
  fetchCloudServicesData,
  fetchVirtualMachineData
  ];

  var onNext = function(func, done) {
    func(config, result, done);
  };

  result.resources = {
    resourceGroups: [],
    storageAccounts: [],
    virtualNetworks: [],
    cloudServices: [],
    loadBalancers: [],
    virtualMachines: []
  };

  async.eachSeries(series, onNext, callback);
};