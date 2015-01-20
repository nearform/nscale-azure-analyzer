nscale-azure-analyzer
================
Analyze your Azure deployment done by
[nscale](http://github.com/nearform/nscale).

###WIP: NOT YET IN A USABLE STATE

##Installation
The nscale-azure-analyzer module can be installed in a variety of ways depending on usage.

###Directly within nscale
If you are deploying nscale to Azure, a simple change to nscale's config file is all that is needed. In
the `modules` section under `analysis`, set the value of `require` to  ___nscale-azure-analyzer___; nscale will
will handle requiring the module.

```bash
{
  ...

  "modules": {
    "protocol": {
      "require": "nscale-protocol"
    },

    ...

    "analysis": {
      "require": "nscale-azure-analyzer"
    }
  }

  ...
}
```

###As a global module
To use as a stand alone node module simply install globally from NPM. The module can then be used by
pointing it to a valid config file. Note, npm may require administrator permission to install global
modules.

```bash
[sudo] npm install nscale-azure-analyzer -g
```

```bash
nscale-azure-analyzer ./path/to/config.json
```

###Embeded in your own project
As well as globally, nscale-azure-analyzer can also be installed locally in a project via NPM. Simply
require `nscale-azure-analyzer`. And call `analyze` to get the results in JSON format.

```bash
[sudo] npm install nscale-azure-analyzer --save
```

```javascript
'use strict';

var fs = require('fs');
var analyzer = require('nscale-azure-analyzer');

var configFile = process.argv[2];
var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

analyzer.analyze(config, null, function(err, result) {
  if (err) {
    process.exit(1);
  }

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
});
```

## Configuration
Regardless of installation method, a particular set of fields are required to be present in the config
file. A sample config can be found in the test directory, it is the same as listed below.

```javascript
{
  "systemId": "4624e815-f814-4802-89b4-e33340a6af46",
  "namespace": "nsd",
  "name": "nsd-test",
  "azureConfig": {
    "subscriptionId": "48f9edd7-b74a-40fe-9a73-278967396ce3",
    "tenantId": "a6e50cd3-0b8a-4390-b5cc-5b927d28608d",
    "authorityUrl": "https://login.windows.net",
    "clientId": "277659f3-0ae5-4161-8400-962c89752676",
    "username": "admin@yourservice.onmicrosoft.com",
    "password": "YoUrPA$$WorD"
  }
}
```

## License

Copyright (c) 2014 Nearform and other contributors

Licensed under the Artistic License 2.0
