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

var async = require('async');

var fetchAzureData = require('./lib/fetchAzureData.js');
var parseResourceGroups = require('./lib/parseResourceGroup.js');
var parseVirtualNetworks = require('./lib/parseVirtualNetworks.js');
var parseStorageAccounts = require('./lib/parseStorageAccounts.js');
var parseCloudServices = require('./lib/parseCloudServices.js');
var parseLoadBalancers = require('./lib/parseLoadBalancers.js');
var parseVirtualMachines = require('./lib/parseVirtualMachines.js');
var postProcessing = require('./lib/postProcessing.js');

var baseResult = function(config, system) {
  return {
    name: system.name || config.name,
    namespace: system.namespace || config.namespace,
    id: system.systemId || config.systemId,
    containerDefinitions: [],
    topology: {
      containers: {}
    }
  };
};

exports.analyze = function analyze(config, system, callback) {
  system = system || {};

  var series = [
    fetchAzureData,
    parseResourceGroups,
    parseStorageAccounts,
    parseVirtualNetworks,
    parseCloudServices,
    parseLoadBalancers,
    parseVirtualMachines,
    postProcessing
  ];

  var result = baseResult(config, system);

  var onNext = function(func, done) {
    func(config, result, function(err) {
      done(null);
    });
  };

  var complete = function(err) {
    callback(err, result);
  };

  async.eachSeries(series, onNext, complete);
};