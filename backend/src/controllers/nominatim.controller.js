const { queryNominatim } = require('../services/nominatim.service');

async function nominatimController(req, res) {
  try {
    const { q, limit, latitude, longitude } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'missing query parameter "q"' });
    }

    const userLocation = latitude != null && longitude != null
      ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
      : null;

    const data = await queryNominatim({
      q,
      limit: limit ? parseInt(limit, 10) : 5,
      userLocation,
    });

    return res.json(data);
  } catch (error) {
    if (error.message.includes('missing query')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('timeout')) {
      return res.status(504).json({
        error: 'timeout',
        detail: error.message,
      });
    }
    return res.status(500).json({
      error: 'internal_error',
      detail: error.message,
    });
  }
}

module.exports = {
  nominatimController,
};
