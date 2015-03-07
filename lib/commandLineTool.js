#!/usr/bin/env node

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

module.exports = (function() {
  var cli = require('commander')
    .version(require('../package.json').version)
    .description('Analyze your nscale deployment on Azure!')
    .option('-c, --config', 'set the path for config')
    .option('-s, --system', 'set the path for system')
    .parse(process.argv);

  if (!cli.args.length) { cli.help(); }

  var config;
  var system;

  try {
    config = require(cli.args[0]);
    system = require(cli.args[1]);
  } catch (err) {
    console.log('missing path for config and/or system');
    return process.exit(-1);
  }

  console.log('Analyzing...');
  var analyzer = require('./analyzer');
  analyzer.analyze(config, system, function(err, result) {
    if (err) {
      console.log(err);
      process.exit(1);
    } else {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    }
  });
})();
