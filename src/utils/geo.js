// utils/geo.js
const axios = require('axios');
const logger = require('../config/loggerConfig');

const geoCache = new Map(); // Simple in-memory cache (or use Redis in production)

async function getGeoLocation(ip) {
    if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.')) {
        return { country: 'Local', countryCode: 'XX', city: 'Dev Machine', flag: '🏠' };
    }

    const cacheKey = ip;
    if (geoCache.has(cacheKey)) {
        return geoCache.get(cacheKey);
    }

    try {
        const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,city,timezone`, {
            timeout: 3000
        });

        if (response.data.status === 'success') {
            const { country, countryCode, city } = response.data;
            const flag = countryCode ? getFlagEmoji(countryCode) : '🌍';
            const result = { country, countryCode, city, flag, timezone: response.data.timezone || 'UTC' };

            geoCache.set(cacheKey, result);
            setTimeout(() => geoCache.delete(cacheKey), 1000 * 60 * 60 * 24); // cache 24h

            return result;
        }
    } catch (err) {
        logger.log('error', 'Geo lookup failed for', ip);
    }

    return { country: 'Unknown', countryCode: 'XX', city: 'Unknown', flag: '🌐' };
}

function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode === 'XX') return '🌍';
    return countryCode
        .toUpperCase()
        .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()));
}

module.exports = { getGeoLocation };