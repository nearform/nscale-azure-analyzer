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

var async = require('async');

var createBaseResult = require('./createBaseResult.js');

var fetchAzureData = require('./fetchAzureData.js');
var parseResourceGroups = require('./parseResourceGroups.js');
var parseVirtualNetworks = require('./parseVirtualNetworks.js');
var parseStorageAccounts = require('./parseStorageAccounts.js');
var parseCloudServices = require('./parseCloudServices.js');
var parseLoadBalancers = require('./parseLoadBalancers.js');
var parseVirtualMachines = require('./parseVirtualMachines.js');
var parseSystem = require('./parseSystem.js');
var postProcessing = require('./postProcessing.js');

exports.analyze = function analyze(config, system, callback) {
  createBaseResult(system, function(err, result) {
    if (err) { return callback(err, result); }

    var onNext = function(func, done) {
      func(config, result, done);
    };

    var complete = function(err) {
      callback(err, result);
    };

    var series = [
      fetchAzureData,
      parseResourceGroups,
      parseStorageAccounts,
      parseVirtualNetworks,
      parseCloudServices,
      parseLoadBalancers,
      parseVirtualMachines,
      parseSystem,
      postProcessing
    ];

    async.eachSeries(series, onNext, complete);
  });
};
