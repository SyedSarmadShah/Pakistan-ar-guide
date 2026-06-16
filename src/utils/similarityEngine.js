const categoryToPreferenceKey = (category = '') => {
  const normalized = String(category).toLowerCase();
  if (/historical|heritage|monument|museum/.test(normalized)) return 'historical';
  if (/valley|park|lake|waterfall|forest|national park/.test(normalized)) return 'nature';
  if (/adventure|hiking|trek|rafting|mountain|climbing/.test(normalized)) return 'adventure';
  if (/religious|mosque|shrine|temple|gurdwara|church/.test(normalized)) return 'religious';
  if (/cultural|market|bazaar|art|festival/.test(normalized)) return 'cultural';
  return null;
};

const budgetLevelToSensitivity = (budgetLevel = '') => {
  const normalized = String(budgetLevel).toLowerCase();
  if (normalized.includes('low') || normalized.includes('budget') || normalized.includes('economy')) return 1;
  if (normalized.includes('medium') || normalized.includes('mid')) return 0.5;
  if (normalized.includes('high') || normalized.includes('luxury') || normalized.includes('premium')) return 0;
  return 0.5;
};

const clamp = (value) => Math.min(1, Math.max(0, Number(value) || 0));

const cosineSimilarity = (a, b) => {
  const keys = Object.keys(a);
  const dot = keys.reduce((sum, key) => sum + (Number(a[key]) || 0) * (Number(b[key]) || 0), 0);
  const magA = Math.sqrt(keys.reduce((sum, key) => sum + (Number(a[key]) || 0) ** 2, 0));
  const magB = Math.sqrt(keys.reduce((sum, key) => sum + (Number(b[key]) || 0) ** 2, 0));
  if (!magA || !magB) return 0;
  return dot / (magA * magB);
};

const buildPlaceVector = (place) => {
  const vector = {
    historical: 0,
    nature: 0,
    adventure: 0,
    religious: 0,
    cultural: 0,
    budgetSensitivity: budgetLevelToSensitivity(place.budgetLevel),
  };

  const categoryKey = categoryToPreferenceKey(place.category);
  if (categoryKey) {
    vector[categoryKey] = 1;
  }

  return vector;
};

const extractPlaceTags = (place) => {
  const tags = [];
  if (place.category) tags.push(String(place.category).toLowerCase());
  if (place.province) tags.push(String(place.province).toLowerCase());
  if (place.season) tags.push(String(place.season).toLowerCase());
  if (place.weatherTag) tags.push(String(place.weatherTag).toLowerCase());
  if (place.budgetLevel) tags.push(String(place.budgetLevel).toLowerCase());
  return [...new Set(tags)];
};

export const computeContentSimilarity = (userProfile = {}, place = {}, context = {}) => {
  const userVector = {
    historical: Number(userProfile.historical) || 0,
    nature: Number(userProfile.nature) || 0,
    adventure: Number(userProfile.adventure) || 0,
    religious: Number(userProfile.religious) || 0,
    cultural: Number(userProfile.cultural) || 0,
    budgetSensitivity: Number(userProfile.budgetSensitivity) || 0.5,
  };

  const placeVector = buildPlaceVector(place);
  let score = cosineSimilarity(userVector, placeVector);
  const reasons = [];

  const categoryKey = categoryToPreferenceKey(place.category);
  if (categoryKey && userVector[categoryKey] > 0.25) {
    reasons.push(`You liked similar ${categoryKey} places`);
  }

  if (place.season && context.currentSeason && String(place.season).toLowerCase().includes(String(context.currentSeason).toLowerCase())) {
    score += 0.08;
    reasons.push(`Good match with ${context.currentSeason} season`);
  }

  if (place.weatherTag && context.weatherType && String(place.weatherTag).toLowerCase() === String(context.weatherType).toLowerCase()) {
    score += 0.05;
    reasons.push('Weather compatibility is strong');
  }

  if (typeof score !== 'number' || Number.isNaN(score)) {
    score = 0;
  }

  score = clamp(score + 0.2);
  return {
    score,
    reasons: [...new Set(reasons)],
    placeVector,
    tags: extractPlaceTags(place),
  };
};

export const findTopSimilarPlaces = (place = {}, allPlaces = [], limit = 3) => {
  const baseTags = extractPlaceTags(place);
  const baseCategory = categoryToPreferenceKey(place.category);
  const normalizedPlaceName = String(place.place || place.name || '').trim();

  return allPlaces
    .filter((other) => String(other.place || other.name || '').trim() !== normalizedPlaceName)
    .map((other) => {
      let score = 0;
      const otherCategory = categoryToPreferenceKey(other.category);
      if (otherCategory && otherCategory === baseCategory) score += 3;
      if (other.province && other.province === place.province) score += 2;
      const otherTags = extractPlaceTags(other);
      const tagOverlap = otherTags.filter((tag) => baseTags.includes(tag)).length;
      score += Math.min(tagOverlap, 3);
      if (String(other.season || '').toLowerCase() === String(place.season || '').toLowerCase() && other.season) score += 1;

      return {
        ...other,
        similarityScore: score,
      };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit)
    .map((item) => ({
      place: item.place || item.name || '',
      city: item.city || '',
      province: item.province || '',
      category: item.category || '',
      score: Number(item.similarityScore.toFixed(2)),
    }));
};
