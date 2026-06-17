/**
 * weatherService.js
 *
 * Fetches current weather from the Open-Meteo API (free, no API key required).
 * API docs: https://open-meteo.com/en/docs
 *
 * Two entry points:
 *  - fetchWeatherByCoords(lat, lon)   → raw Open-Meteo current data + derived fields
 *  - getPlaceWeather(place)           → accepts a parsed place object {lat, lon, city}
 *                                       and returns a normalised WeatherResult
 *
 * Results are cached in memory for CACHE_TTL_MS (10 minutes) so repeated renders
 * of the same destination don't generate extra network requests.
 */

// ---------------------------------------------------------------------------
// WMO Weather Interpretation Code mapping
// Reference: https://open-meteo.com/en/docs#weathervariables
// ---------------------------------------------------------------------------
const WMO_CODES = {
  0:  { label: 'Clear sky',              icon: '☀️',  type: 'sunny'  },
  1:  { label: 'Mainly clear',           icon: '🌤️',  type: 'sunny'  },
  2:  { label: 'Partly cloudy',          icon: '⛅',  type: 'cloudy' },
  3:  { label: 'Overcast',               icon: '☁️',  type: 'cloudy' },
  45: { label: 'Fog',                    icon: '🌫️',  type: 'cloudy' },
  48: { label: 'Icy fog',                icon: '🌫️',  type: 'cloudy' },
  51: { label: 'Light drizzle',          icon: '🌦️',  type: 'rainy'  },
  53: { label: 'Moderate drizzle',       icon: '🌦️',  type: 'rainy'  },
  55: { label: 'Dense drizzle',          icon: '🌧️',  type: 'rainy'  },
  61: { label: 'Slight rain',            icon: '🌧️',  type: 'rainy'  },
  63: { label: 'Moderate rain',          icon: '🌧️',  type: 'rainy'  },
  65: { label: 'Heavy rain',             icon: '🌧️',  type: 'rainy'  },
  66: { label: 'Freezing rain',          icon: '🌨️',  type: 'snowy'  },
  67: { label: 'Heavy freezing rain',    icon: '🌨️',  type: 'snowy'  },
  71: { label: 'Slight snow',            icon: '❄️',  type: 'snowy'  },
  73: { label: 'Moderate snow',          icon: '❄️',  type: 'snowy'  },
  75: { label: 'Heavy snow',             icon: '❄️',  type: 'snowy'  },
  77: { label: 'Snow grains',            icon: '🌨️',  type: 'snowy'  },
  80: { label: 'Slight showers',         icon: '🌦️',  type: 'rainy'  },
  81: { label: 'Moderate showers',       icon: '🌧️',  type: 'rainy'  },
  82: { label: 'Violent showers',        icon: '⛈️',  type: 'rainy'  },
  85: { label: 'Slight snow showers',    icon: '🌨️',  type: 'snowy'  },
  86: { label: 'Heavy snow showers',     icon: '🌨️',  type: 'snowy'  },
  95: { label: 'Thunderstorm',           icon: '⛈️',  type: 'rainy'  },
  96: { label: 'Thunderstorm w/ hail',   icon: '⛈️',  type: 'rainy'  },
  99: { label: 'Thunderstorm w/ hail',   icon: '⛈️',  type: 'rainy'  },
};

const resolveWmo = (code) =>
  WMO_CODES[code] ?? { label: 'Unknown', icon: '☁️', type: 'normal' };

// ---------------------------------------------------------------------------
// Travel advice derived from live conditions
// ---------------------------------------------------------------------------
const buildAdvice = ({ temperatureC, precipitationMm, windspeedKmh, wmoCode }) => {
  if (temperatureC < 0) return { text: '🥶 Extreme cold — dress in heavy layers', severity: 'danger' };
  if (temperatureC > 42) return { text: '🔥 Extreme heat — avoid midday exposure', severity: 'danger' };
  if (wmoCode >= 95) return { text: '⛈️ Thunderstorm — delay outdoor plans', severity: 'danger' };
  if ([65, 67, 75, 86, 82].includes(wmoCode))
    return { text: '⚠️ Heavy precipitation — travel carefully', severity: 'warning' };
  if (precipitationMm > 5) return { text: '🌧️ Significant rain — carry waterproofs', severity: 'warning' };
  if (windspeedKmh > 60) return { text: '💨 Strong winds — secure loose gear', severity: 'warning' };
  if ([71, 73, 77, 85].includes(wmoCode))
    return { text: '❄️ Snowfall — road conditions may be poor', severity: 'warning' };
  if (temperatureC < 5) return { text: '🧥 Very cold — warm clothing essential', severity: 'info' };
  if (temperatureC > 35) return { text: '🌡️ Very hot — stay hydrated', severity: 'info' };
  return { text: '✅ Good conditions for travel', severity: 'good' };
};

// ---------------------------------------------------------------------------
// In-memory cache  { cacheKey → { result, expiresAt } }
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const _cache = {};

const cacheKey = (lat, lon) =>
  `${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`;

// ---------------------------------------------------------------------------
// Core fetch
// ---------------------------------------------------------------------------

/**
 * Fetch current weather from Open-Meteo for a lat/lon pair.
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<WeatherResult>}
 *
 * WeatherResult shape:
 * {
 *   temperatureC: number,
 *   feelsLikeC: number,
 *   humidity: number,          // percent
 *   windspeedKmh: number,
 *   precipitationMm: number,   // last hour
 *   uvIndex: number,
 *   wmoCode: number,
 *   condition: string,         // human-readable label
 *   icon: string,              // emoji
 *   type: string,              // 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'normal'
 *   advice: { text, severity },
 *   isDay: boolean,
 *   fetchedAt: string,         // ISO timestamp
 * }
 */
export const fetchWeatherByCoords = async (lat, lon) => {
  const key = cacheKey(lat, lon);

  // Return cached result if still fresh
  if (_cache[key] && _cache[key].expiresAt > Date.now()) {
    return _cache[key].result;
  }

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'uv_index',
      'is_day',
    ].join(','),
    wind_speed_unit: 'kmh',
    timezone: 'Asia/Karachi',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed: ${response.status}`);
  }

  const json = await response.json();
  const c = json.current;

  const wmoCode = c.weather_code ?? 0;
  const wmo = resolveWmo(wmoCode);
  const temperatureC = c.temperature_2m ?? 0;
  const precipitationMm = c.precipitation ?? 0;
  const windspeedKmh = c.wind_speed_10m ?? 0;

  const result = {
    temperatureC: Number(temperatureC.toFixed(1)),
    feelsLikeC: Number((c.apparent_temperature ?? temperatureC).toFixed(1)),
    humidity: c.relative_humidity_2m ?? 0,
    windspeedKmh: Number(windspeedKmh.toFixed(1)),
    precipitationMm: Number(precipitationMm.toFixed(1)),
    uvIndex: c.uv_index ?? 0,
    wmoCode,
    condition: wmo.label,
    icon: wmo.icon,
    type: wmo.type,
    advice: buildAdvice({ temperatureC, precipitationMm, windspeedKmh, wmoCode }),
    isDay: c.is_day === 1,
    fetchedAt: new Date().toISOString(),
  };

  _cache[key] = { result, expiresAt: Date.now() + CACHE_TTL_MS };
  return result;
};

// ---------------------------------------------------------------------------
// Convenience wrapper — accepts a place object from the recommendation engine
// ---------------------------------------------------------------------------

/**
 * Get weather for a place object. Resolves coordinates from the place's own
 * lat/lon fields, falling back to a static city-coordinate map.
 *
 * @param {object} place  - { lat, lon, city, ... }
 * @param {object} cityCoordinates - { CityName: { lat, lon } } fallback map
 * @returns {Promise<WeatherResult | null>}  null if no coordinates are available
 */
export const getPlaceWeather = async (place, cityCoordinates = {}) => {
  let lat = null;
  let lon = null;

  // Prefer exact coordinates from the dataset
  if (place.lat != null && place.lon != null &&
      !Number.isNaN(Number(place.lat)) && !Number.isNaN(Number(place.lon))) {
    lat = Number(place.lat);
    lon = Number(place.lon);
  } else if (place.city && cityCoordinates[place.city]) {
    // Fall back to city-level coordinates
    lat = cityCoordinates[place.city].lat;
    lon = cityCoordinates[place.city].lon;
  }

  if (lat == null || lon == null) return null;

  try {
    return await fetchWeatherByCoords(lat, lon);
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// Batch helper — fetches weather for an array of places, honouring the cache.
// Runs all fetches in parallel; individual failures return null for that place.
// ---------------------------------------------------------------------------

/**
 * @param {object[]} places
 * @param {object}   cityCoordinates
 * @returns {Promise<Map<string, WeatherResult | null>>}
 *   Map keyed by place.place (place name string)
 */
export const batchFetchWeather = async (places, cityCoordinates = {}) => {
  const results = await Promise.allSettled(
    places.map((p) => getPlaceWeather(p, cityCoordinates))
  );

  const map = new Map();
  places.forEach((p, i) => {
    const outcome = results[i];
    map.set(p.place, outcome.status === 'fulfilled' ? outcome.value : null);
  });
  return map;
};
