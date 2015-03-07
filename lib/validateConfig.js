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

module.exports = function validateConfig(config) {
  var result = {
    failed: true,
  };

  if (!config) {
    result.message = 'missing config';
    return result;
  }

  if (!config.systemId) {
    result.message = 'missing config.systemId';
    return result;
  }

  if (!config.namespace) {
    result.message = 'missing config.namespace';
    return result;
  }

  if (!config.name) {
    result.message = 'missing config.name';
    return result;
  }

  var azureConfig = config.azureConfig;
  if (!azureConfig) {
    result.message = 'missing config.azureConfig';
    return result;
  }

  if (!azureConfig.subscriptionId) {
    result.message = 'missing azureConfig.subscriptionId';
    return result;
  }

  if (!azureConfig.tenantId) {
    result.message = 'missing azureConfig.tenantId';
    return result;
  }

  if (!azureConfig.authorityUrl) {
    result.message = 'missing azureConfig.authorityUrl';
    return result;
  }

  if (!azureConfig.clientId) {
    result.message = 'missing azureConfig.clientId';
    return result;
  }

  if (!azureConfig.username) {
    result.message = 'missing azureConfig.userame';
    return result;
  }

  if (!azureConfig.password) {
    result.message = 'missing azureConfig.password';
    return result;
  }

  result.failed = false;
  return result;
};
