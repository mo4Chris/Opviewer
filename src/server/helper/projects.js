var { logger } = require('./logging')

module.exports = {};


/**
 * Loads in weather provider information corresponding to a provider id
 *
 * @param {number} provider_id Id of the provider
 * @api public
 * @returns {Promise<{id: number, name: string, display_name: string}>}
 */
async function getWeatherProvider(provider_id) {
  logger.debug({provider_id}, 'Loading weather provided')
  const out = await pg_get('/metocean_providers')
  const providers = out.data['metocean_providers'];
  return providers.find(provider => provider.id == provider_id)
}
module.exports.getWeatherProvider = getWeatherProvider;
