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

  it('should not err on valid config', function() {
    var result = validateConfig(validConfig);

    expect(result.failed).to.be.false();
    expect(result.message).to.be.falsy();
  });

  it('should err on missing config', function() {
    var result = validateConfig(null);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();
  });

  it('should err on missing config.systemId', function() {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.systemId;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();
  });

  it('should err on missing config.namespace', function() {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.namespace;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();
  });

  it('should err on missing config.name', function() {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.name;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();
  });

  it('should err on missing config.azureConfig', function() {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.azureConfig;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();
  });

  it('should err on missing azureConfig.subscriptionId', function() {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.azureConfig.subscriptionId;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();
  });

  it('should err on missing azureConfig.tenantId', function() {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.azureConfig.tenantId;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();
  });

  it('should err on missing azureConfig.authorityUrl', function() {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.azureConfig.authorityUrl;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();
  });

  it('should err on missing azureConfig.clientId', function() {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.azureConfig.clientId;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();
  });

  it('should err on missing azureConfig.userName', function() {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.azureConfig.username;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();
  });

  it('should err on missing azureConfig.password', function() {
    var invalidConfig = _.cloneDeep(validConfig);
    delete invalidConfig.azureConfig.password;
    var result = validateConfig(invalidConfig);

    expect(result.failed).to.be.true();
    expect(result.message).to.be.truthy();
  });
});