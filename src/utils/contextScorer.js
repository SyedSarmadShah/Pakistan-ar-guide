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
  if (typeof place.lat === 'number' && typeof place.lon === 'number') {
    return { lat: place.lat, lon: place.lon };
  }
  if (!place.city || !context?.cityCoordinates) return null;
  return context.cityCoordinates[place.city] || null;
};

export const scoreContext = (place = {}, context = {}, userProfile = {}) => {
  const currentSeason = context.currentSeason || '';
  const weatherType = context.weatherType || '';
  const budgetSensitivity = Number(userProfile.budgetSensitivity) || 0.5;
  const desiredDurationDays = Number(context.desiredTripDays) || null;

  const seasonFit = scoreSeasonFit(place.season || place.bestSeason, currentSeason);
  const weatherFit = scoreWeatherFit(place.weatherTag, weatherType);

  const placeLocation = resolvePlaceLocation(place, context);
  const distanceKm = placeLocation && context.userLocation ? haversineKm(context.userLocation, placeLocation) : null;
  const distanceFit = scoreDistanceFit(distanceKm, budgetSensitivity);
  const budgetFit = scoreBudgetFit(budgetSensitivity, place.budgetLevel);
  const durationFit = scoreDurationFit(place.tripDays, desiredDurationDays);

  const rawScore = seasonFit.score * 1.1 + weatherFit.score * 0.9 + distanceFit.score * 1.0 + budgetFit.score * 0.8 + durationFit.score * 0.6;
  const maxScore = 4.4;
  const normalizedScore = clamp(rawScore / maxScore);

  const reasons = [seasonFit.reason, weatherFit.reason, distanceFit.reason, budgetFit.reason, durationFit.reason].filter(Boolean);
  return {
    score: normalizedScore,
    reasons: [...new Set(reasons)],
    distanceKm: typeof distanceKm === 'number' ? Number(distanceKm.toFixed(1)) : null,
  };
};
