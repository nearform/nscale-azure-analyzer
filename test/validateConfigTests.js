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

var expect = require('must');
var _ = require('lodash');

var validateConfig = require('../lib/validateConfig.js');
var sampleConfig = require('./data/sample-config.json');

describe('validateConfig.js:', function() {
  var validConfig;

  beforeEach(function() {
    validConfig = _.cloneDeep(sampleConfig);
  });

  it('should not err on valid config', function(done) {
    var result = validateConfig(validConfig);

    expect(result.failed).to.be.false();
    expect(result.message).to.be.falsy();

    done();
  });

  it('should err on missing config', function(done) {
    var result = validateConfig(null);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();

    done();
  });

  it('should err on missing config.systemId', function(done) {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.systemId;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();

    done();
  });

  it('should err on missing config.namespace', function(done) {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.namespace;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();

    done();
  });

  it('should err on missing config.name', function(done) {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.name;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();

    done();
  });

  it('should err on missing config.azureConfig', function(done) {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.azureConfig;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();

    done();
  });

  it('should err on missing azureConfig.subscriptionId', function(done) {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.azureConfig.subscriptionId;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();

    done();
  });

  it('should err on missing azureConfig.tenantId', function(done) {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.azureConfig.tenantId;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();

    done();
  });

  it('should err on missing azureConfig.authorityUrl', function(done) {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.azureConfig.authorityUrl;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();

    done();
  });

  it('should err on missing azureConfig.clientId', function(done) {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.azureConfig.clientId;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();

    done();
  });

  it('should err on missing azureConfig.userName', function(done) {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.azureConfig.username;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();

    done();
  });

  it('should err on missing azureConfig.password', function(done) {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.azureConfig.password;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();

    done();
  });
});
