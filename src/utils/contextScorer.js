const toRad = (value) => (value * Math.PI) / 180;
const haversineKm = (a, b) => {
  if (!a || !b || a.lat == null || b.lat == null) return null;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const aa = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
};

const clamp = (value) => Math.min(1, Math.max(0, Number(value) || 0));

const scoreSeasonFit = (placeSeason = '', currentSeason = '') => {
  if (!placeSeason || placeSeason.toLowerCase() === 'all') return { score: 0.6, reason: 'Suitable year-round' };
  if (currentSeason && placeSeason.toLowerCase().includes(currentSeason.toLowerCase())) {
    return { score: 1, reason: `Good match with ${currentSeason}` };
  }
  return { score: 0.2, reason: `Not typically recommended for ${currentSeason}` };
};

const scoreWeatherFit = (placeWeather = '', weatherType = '') => {
  if (!placeWeather || !weatherType) return { score: 0.5, reason: 'Weather compatibility is neutral' };
  const normalized = placeWeather.toLowerCase();
  if (normalized === weatherType.toLowerCase()) {
    return { score: 1, reason: 'Weather is a strong fit' };
  }
  return { score: 0.25, reason: 'Current weather may not be ideal' };
};

/**
 * Score a place based on *live* weather data from Open-Meteo.
 *
 * The live score supplements (but does not replace) the static weather_tag
 * match from scoreWeatherFit. It accounts for:
 *   - Temperature extremes that make a visit unpleasant or dangerous
 *   - Active precipitation discouraging travel
 *   - High UV index (relevant for outdoor/mountain destinations)
 *   - Strong winds (relevant for trekking / mountain passes)
 *
 * Returns a { score 0–1, reason, severity } object.
 * When no live weather is available the function returns a neutral 0.5.
 *
 * @param {object|null} liveWeather  - WeatherResult from weatherService, or null
 * @param {string}      category     - place category (e.g. 'Valley', 'Trekking')
 */
export const scoreLiveWeather = (liveWeather, category = '') => {
  if (!liveWeather) return { score: 0.5, reason: 'Live weather data not yet available', severity: 'neutral' };

  const { temperatureC, precipitationMm, windspeedKmh, uvIndex, wmoCode, type } = liveWeather;
  const cat = category.toLowerCase();
  const isOutdoor = /trek|valley|mountain|lake|meadow|park|hill|pass|nature|camp/.test(cat);

  let score = 0.75; // start optimistic
  const notes = [];

  // ── Temperature penalties ────────────────────────────────────────────────
  if (temperatureC < -5) {
    score -= 0.45;
    notes.push('Extreme cold — dangerous for most visitors');
  } else if (temperatureC < 0) {
    score -= 0.25;
    notes.push('Below freezing — prepare for icy conditions');
  } else if (temperatureC < 5) {
    score -= 0.1;
    notes.push('Very cold — warm clothing required');
  } else if (temperatureC > 44) {
    score -= 0.45;
    notes.push('Extreme heat — health risk outdoors');
  } else if (temperatureC > 38) {
    score -= 0.2;
    notes.push('Very hot — limit midday outdoor exposure');
  } else if (temperatureC >= 18 && temperatureC <= 28) {
    // Ideal band
    score += 0.1;
    notes.push('Comfortable temperature for sightseeing');
  }

  // ── Precipitation penalties ──────────────────────────────────────────────
  if (precipitationMm > 10) {
    score -= 0.3;
    notes.push('Heavy rainfall — travel disruption likely');
  } else if (precipitationMm > 3) {
    score -= 0.15;
    notes.push('Moderate rain — carry waterproofs');
  } else if (precipitationMm > 0.5) {
    score -= 0.05;
    notes.push('Light drizzle — minor inconvenience');
  }

  // ── Snow / ice codes ─────────────────────────────────────────────────────
  if ([71, 73, 75, 77, 85, 86, 66, 67].includes(wmoCode)) {
    score -= isOutdoor ? 0.25 : 0.1;
    notes.push(isOutdoor ? 'Snowfall — outdoor trails may be impassable' : 'Snowfall — scenic but limit travel');
  }

  // ── Thunderstorm ─────────────────────────────────────────────────────────
  if (wmoCode >= 95) {
    score -= 0.4;
    notes.push('Active thunderstorm — avoid outdoor activities');
  }

  // ── Wind (outdoor/mountain destinations only) ────────────────────────────
  if (isOutdoor) {
    if (windspeedKmh > 80) {
      score -= 0.3;
      notes.push('Dangerous winds — trekking/climbing unsafe');
    } else if (windspeedKmh > 50) {
      score -= 0.15;
      notes.push('Strong winds — check trail conditions');
    }
  }

  // ── UV index (outdoor only) ───────────────────────────────────────────────
  if (isOutdoor && uvIndex > 10) {
    score -= 0.1;
    notes.push('Very high UV — sun protection essential');
  }

  // ── Clear / sunny bonus ───────────────────────────────────────────────────
  if (type === 'sunny' && precipitationMm === 0 && score > 0.5) {
    score += 0.1;
    notes.push('Clear skies — ideal conditions');
  }

  const finalScore = Math.min(1, Math.max(0, score));

  let severity = 'good';
  if (finalScore < 0.35) severity = 'danger';
  else if (finalScore < 0.55) severity = 'warning';
  else if (finalScore < 0.7) severity = 'info';

  return {
    score: finalScore,
    reason: notes[0] || 'Live weather looks fine',
    severity,
  };
};

const scoreDistanceFit = (distanceKm, budgetSensitivity = 0) => {
  if (distanceKm == null) return { score: 0.5, reason: 'Distance information unavailable' };

  let score = 0;
  let reason = 'Distance is neutral for your trip';

  if (distanceKm <= 100) {
    score = 1;
    reason = 'Nearby destination';
  } else if (distanceKm <= 300) {
    score = 0.75;
    reason = 'Reasonable regional distance';
  } else if (distanceKm <= 700) {
    score = 0.45;
    reason = 'Longer travel distance';
  } else {
    score = 0.2;
    reason = 'Far travel distance may be demanding';
  }

  if (budgetSensitivity > 0.7) {
    if (distanceKm <= 100) {
      score = clamp(score + 0.15);
      reason = 'Nearby travel fits your budget preference';
    }
    if (distanceKm > 500) {
      score = clamp(score - 0.2);
      reason = 'Far travel may be costly for your budget profile';
    }
  }

  return { score, reason };
};

const scoreBudgetFit = (budgetSensitivity = 0, budgetLevel = '') => {
  const normalized = String(budgetLevel).toLowerCase();
  if (!normalized) return { score: 0.5, reason: 'No budget preference available' };

  if (budgetSensitivity > 0.7) {
    if (normalized.includes('low') || normalized.includes('budget') || normalized.includes('economy')) {
      return { score: 1, reason: 'Well matched to budget-conscious travel' };
    }
    return { score: 0.2, reason: 'This option may exceed your budget preference' };
  }

  if (budgetSensitivity < 0.3) {
    if (normalized.includes('high') || normalized.includes('luxury') || normalized.includes('premium')) {
      return { score: 1, reason: 'Fits your low budget sensitivity' };
    }
    return { score: 0.6, reason: 'Budget level is acceptable' };
  }

  return { score: 0.75, reason: 'Budget compatibility is moderate' };
};

const parseTripDays = (tripDays) => {
  if (typeof tripDays === 'number') return tripDays;
  if (!tripDays) return null;
  const numeric = Number(String(tripDays).match(/\d+/)?.[0]);
  return Number.isNaN(numeric) ? null : numeric;
};

const scoreDurationFit = (placeDuration, desiredDays) => {
  const duration = parseTripDays(placeDuration);
  if (!duration || !desiredDays) return { score: 0.5, reason: 'Duration compatibility is neutral' };

  if (Math.abs(duration - desiredDays) <= 1) {
    return { score: 1, reason: 'Trip duration fits your plan' };
  }

  if (duration <= desiredDays) {
    return { score: 0.75, reason: 'Place duration fits into your travel window' };
  }

  return { score: 0.3, reason: 'Place may require more time than planned' };
};

const resolvePlaceLocation = (place, context) => {
  // parseFloat on a CSV string produces a number, but an empty/missing value
  // produces NaN — which is typeof 'number' but not a valid coordinate.
  if (
    typeof place.lat === 'number' && !Number.isNaN(place.lat) &&
    typeof place.lon === 'number' && !Number.isNaN(place.lon)
  ) {
    return { lat: place.lat, lon: place.lon };
  }
  // Fall back to city-level coordinates from context when place coords are absent.
  if (!place.city || !context?.cityCoordinates) return null;
  return context.cityCoordinates[place.city] || null;
};

/**
 * scoreContext
 *
 * Scores a place against the user's current context (season, weather, location,
 * budget, trip duration). When a live WeatherResult from Open-Meteo is provided
 * via `context.liveWeather`, it replaces the static weather-tag match with a
 * richer real-conditions score and adjusts weights accordingly.
 *
 * @param {object} place
 * @param {object} context        - may include: currentSeason, weatherType,
 *                                  userLocation, cityCoordinates, desiredTripDays,
 *                                  liveWeather (WeatherResult | null)
 * @param {object} userProfile
 */
export const scoreContext = (place = {}, context = {}, userProfile = {}) => {
  const currentSeason = context.currentSeason || '';
  const weatherType = context.weatherType || '';
  const budgetSensitivity = Number(userProfile.budgetSensitivity) || 0.5;
  const desiredDurationDays = Number(context.desiredTripDays) || null;

  const seasonFit = scoreSeasonFit(place.season || place.bestSeason, currentSeason);

  // Live weather from Open-Meteo takes priority over static weather-tag matching.
  // We still compute the static fit as a fallback when live data is absent.
  const liveWeather = context.liveWeather ?? null;
  const liveScore   = scoreLiveWeather(liveWeather, place.category || '');
  const staticFit   = scoreWeatherFit(place.weatherTag, weatherType);

  // Blend: live weather has full weight when available; fall back to static otherwise.
  const weatherFit = liveWeather
    ? { score: liveScore.score * 0.7 + staticFit.score * 0.3, reason: liveScore.reason }
    : staticFit;

  const placeLocation = resolvePlaceLocation(place, context);
  const distanceKm = placeLocation && context.userLocation ? haversineKm(context.userLocation, placeLocation) : null;
  const distanceFit = scoreDistanceFit(distanceKm, budgetSensitivity);
  const budgetFit = scoreBudgetFit(budgetSensitivity, place.budgetLevel);
  const durationFit = scoreDurationFit(place.tripDays, desiredDurationDays);

  // When live weather is available increase its weight slightly at the expense
  // of the static season signal, since real conditions are more trustworthy.
  const w = liveWeather
    ? { season: 0.9, weather: 1.1, distance: 1.0, budget: 0.8, duration: 0.6 }
    : { season: 1.1, weather: 0.9, distance: 1.0, budget: 0.8, duration: 0.6 };

  const rawScore =
    seasonFit.score   * w.season   +
    weatherFit.score  * w.weather  +
    distanceFit.score * w.distance +
    budgetFit.score   * w.budget   +
    durationFit.score * w.duration;

  const maxScore = w.season + w.weather + w.distance + w.budget + w.duration;
  const normalizedScore = clamp(rawScore / maxScore);

  const reasons = [
    seasonFit.reason,
    weatherFit.reason,
    distanceFit.reason,
    budgetFit.reason,
    durationFit.reason,
  ].filter(Boolean);

  return {
    score: normalizedScore,
    reasons: [...new Set(reasons)],
    distanceKm: typeof distanceKm === 'number' ? Number(distanceKm.toFixed(1)) : null,
    liveWeatherSeverity: liveWeather ? liveScore.severity : null,
  };
};
