import { computeContentSimilarity, findTopSimilarPlaces } from './similarityEngine';
import { scoreContext } from './contextScorer';
import { getTrendingScore } from './trending';

const clamp = (value) => Math.min(1, Math.max(0, Number(value) || 0));
const normalizeName = (place) => String(place.name || place.place || '').trim();

const computeUserBehaviorScore = (place, userProfile = {}) => {
  const placeName = normalizeName(place);
  const category = place.category || '';
  const likedCategories = userProfile.likedCategories || [];
  const interactions = userProfile.interactions || {};

  let score = 0;
  const reasons = [];

  if ((userProfile.favorites || []).includes(placeName)) {
    score += 0.25;
    reasons.push('Previously saved as favorite');
  }
  if ((userProfile.visitedPlaces || []).includes(placeName)) {
    score += 0.1;
    reasons.push('Already viewed this place before');
  }
  if (category && likedCategories.includes(category)) {
    score += 0.15;
    reasons.push(`Matches your preferred ${category} interest`);
  }

  const clickCount = Number(interactions.clicks?.[placeName] || 0);
  score += clamp(clickCount * 0.03);
  if (clickCount > 0) reasons.push('You clicked this place before');

  const favoriteCount = Number(interactions.favorites?.[placeName] || 0);
  score += clamp(favoriteCount * 0.08);

  const skipCount = Number(interactions.skips?.[placeName] || 0);
  score -= clamp(skipCount * 0.12);
  if (skipCount > 0) reasons.push('This place was skipped previously');

  const timeSpent = Number(interactions.timeSpent?.[placeName] || 0);
  score += clamp(Math.min(timeSpent / 300, 0.18));
  if (timeSpent > 20) reasons.push('You spent longer reading about this place');

  const searchMatch = (userProfile.searchHistory || []).some((query) =>
    String(query).toLowerCase().includes(String(place.category || '').toLowerCase()) ||
    String(query).toLowerCase().includes(String(place.province || '').toLowerCase())
  );
  if (searchMatch) {
    score += 0.08;
    reasons.push('Search history suggests this destination type');
  }

  return { score: clamp(score), reasons };
};

const computeTrendingBoost = (placeName) => {
  const raw = getTrendingScore(placeName) || 0;
  const score = clamp(raw / 5);
  return {
    score,
    reasons: score > 0.3 ? ['Popular among users with similar interests'] : [],
  };
};

export const calculateScore = (place, userProfile = {}, context = {}, allPlaces = []) => {
  const placeName = normalizeName(place);
  const content = computeContentSimilarity(userProfile, place, context);
  const contextScore = scoreContext(place, context, userProfile);
  const behavior = computeUserBehaviorScore(place, userProfile);
  const trending = computeTrendingBoost(placeName);

  const WEIGHTS = {
    content: 0.4,
    behavior: 0.25,
    context: 0.25,
    trending: 0.1,
  };

  const finalScore = clamp(
    content.score * WEIGHTS.content +
    behavior.score * WEIGHTS.behavior +
    contextScore.score * WEIGHTS.context +
    trending.score * WEIGHTS.trending
  );

  const reasons = [
    ...content.reasons,
    ...behavior.reasons,
    ...contextScore.reasons,
    ...trending.reasons,
  ].filter(Boolean);

  return {
    finalScore: Number((finalScore * 100).toFixed(0)),
    contentScore: Number((content.score * 100).toFixed(0)),
    contextScore: Number((contextScore.score * 100).toFixed(0)),
    userBehaviorScore: Number((behavior.score * 100).toFixed(0)),
    trendingScore: Number((trending.score * 100).toFixed(0)),
    reasons: [...new Set(reasons)],
    scoreBreakdown: [...new Set(reasons)],
    distanceKm: contextScore.distanceKm,
    similarPlaces: findTopSimilarPlaces(place, allPlaces, 3),
  };
};

export const rankPlaces = (places, userProfile = {}, context = {}) => {
  return [...places]
    .map((place) => {
      const result = calculateScore(place, userProfile, context, places);
      return {
        ...place,
        name: place.name || place.place,
        bestSeason: place.bestSeason || place.season || '',
        score: result.finalScore,
        contentScore: result.contentScore,
        contextScore: result.contextScore,
        userBehaviorScore: result.userBehaviorScore,
        trendingScore: result.trendingScore,
        scoreBreakdown: result.scoreBreakdown,
        distanceKm: result.distanceKm,
        similarPlaces: result.similarPlaces,
      };
    })
    .sort((a, b) => b.score - a.score);
};
