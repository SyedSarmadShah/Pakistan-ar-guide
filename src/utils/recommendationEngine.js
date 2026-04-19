import { getTrendingScore } from './trending';

const includesText = (text, keyword) => {
  return String(text || '').toLowerCase().includes(String(keyword || '').toLowerCase());
};

const toRad = (value) => (value * Math.PI) / 180;

const haversineKm = (a, b) => {
  if (!a || !b) return null;
  const R = 6371;
  const dLat = toRad((b.lat || 0) - (a.lat || 0));
  const dLon = toRad((b.lon || 0) - (a.lon || 0));
  const lat1 = toRad(a.lat || 0);
  const lat2 = toRad(b.lat || 0);

  const aa =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
};

const resolvePlaceLocation = (place, context) => {
  const city = place.city || '';
  if (!city || !context?.cityCoordinates) return null;
  return context.cityCoordinates[city] || null;
};

export const calculateScore = (place, user, context) => {
  let score = 0;
  const placeName = place.name || place.place || '';
  const season = place.bestSeason || place.season || '';
  const breakdown = [];

  if ((user.likedCategories || []).includes(place.category)) {
    score += 5;
    breakdown.push('Category match');
  }

  if ((user.favorites || []).includes(placeName)) {
    score += 4;
    breakdown.push('Favorite boost');
  }

  if ((user.visitedPlaces || []).includes(placeName)) {
    score += 1;
  }

  if (includesText(season, context.currentSeason)) {
    score += 3;
    breakdown.push('Season match');
  }

  if (place.rating) {
    score += place.rating * 2;
    breakdown.push('High rating');
  }

  score += (place.popularity || 0) * 0.1;

  if (place.weatherTag && place.weatherTag === context.weatherType) {
    score += 2;
    breakdown.push('Weather match');
  }

  const trendBoost = getTrendingScore(placeName) * 0.5;
  score += trendBoost;
  if (trendBoost > 0) {
    breakdown.push('Trending');
  }

  const placeLocation = resolvePlaceLocation(place, context);
  const distanceKm = context?.userLocation && placeLocation ? haversineKm(context.userLocation, placeLocation) : null;

  if (typeof distanceKm === 'number') {
    if (distanceKm <= 100) {
      score += 10;
      breakdown.push('Nearby');
    } else if (distanceKm <= 500) {
      score += 5;
      breakdown.push('Regional match');
    }
  }

  return {
    score: Number(score.toFixed(2)),
    distanceKm: typeof distanceKm === 'number' ? Number(distanceKm.toFixed(1)) : null,
    scoreBreakdown: breakdown,
  };
};

export const rankPlaces = (places, user, context) => {
  return [...places]
    .map((place) => {
      const result = calculateScore(place, user, context);
      return {
        ...place,
        name: place.name || place.place,
        bestSeason: place.bestSeason || place.season || '',
        score: result.score,
        distanceKm: result.distanceKm,
        scoreBreakdown: result.scoreBreakdown,
      };
    })
    .sort((a, b) => b.score - a.score);
};