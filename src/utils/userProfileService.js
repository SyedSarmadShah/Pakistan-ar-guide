import { submitUserEvent } from './apiService';

const PROFILE_KEY = 'userProfile';

const defaultProfile = () => ({
  historical: 0,
  nature: 0,
  adventure: 0,
  religious: 0,
  cultural: 0,
  budgetSensitivity: 0,
  favorites: [],
  visitedPlaces: [],
  likedCategories: [],
  searchHistory: [],
  interactions: {
    clicks: {},
    favorites: {},
    skips: {},
    timeSpent: {},
  },
});

const clamp = (value) => Math.min(1, Math.max(0, Number(value) || 0));

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

const loadProfile = () => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (!stored) {
      const next = defaultProfile();
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      return next;
    }
    const parsed = JSON.parse(stored);
    return { ...defaultProfile(), ...parsed };
  } catch (error) {
    const next = defaultProfile();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    return next;
  }
};

const saveProfile = (profile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
};

export const getUserProfile = () => loadProfile();

export const updateUserProfile = (updates) => {
  const profile = loadProfile();
  const next = { ...profile, ...updates };
  return saveProfile(next);
};

const adjustBudgetSensitivity = (current, action, budgetLevel) => {
  const base = budgetLevelToSensitivity(budgetLevel);
  if (action === 'favorite') return clamp(current + (1 - base) * 0.2);
  if (action === 'click') return clamp(current + (1 - base) * 0.08);
  if (action === 'skip') return clamp(current + 0.1);
  return current;
};

const weightForAction = (action, timeSpentSeconds) => {
  if (action === 'favorite') return 0.16;
  if (action === 'timeSpent') return Math.min(0.18, 0.06 * (Number(timeSpentSeconds) / 30));
  if (action === 'click') return 0.04;
  if (action === 'skip') return -0.14;
  return 0;
};

export const updatePreferenceProfile = async ({ action, place, timeSpentSeconds = 0 }) => {
  if (!place) return loadProfile();

  const profile = loadProfile();
  const placeName = place.place || place.name || '';
  const category = place.category || '';
  const preferenceKey = categoryToPreferenceKey(category);
  const delta = weightForAction(action, timeSpentSeconds);

  if (preferenceKey) {
    profile[preferenceKey] = clamp(profile[preferenceKey] + delta);
  }

  profile.budgetSensitivity = adjustBudgetSensitivity(profile.budgetSensitivity, action, place.budgetLevel);

  const interactions = { ...profile.interactions };
  if (!interactions.clicks) interactions.clicks = {};
  if (!interactions.favorites) interactions.favorites = {};
  if (!interactions.skips) interactions.skips = {};
  if (!interactions.timeSpent) interactions.timeSpent = {};

  if (action === 'click') {
    interactions.clicks[placeName] = (interactions.clicks[placeName] || 0) + 1;
  }
  if (action === 'favorite') {
    interactions.favorites[placeName] = (interactions.favorites[placeName] || 0) + 1;
  }
  if (action === 'skip') {
    interactions.skips[placeName] = (interactions.skips[placeName] || 0) + 1;
  }
  if (action === 'timeSpent') {
    interactions.timeSpent[placeName] = (interactions.timeSpent[placeName] || 0) + Number(timeSpentSeconds);
  }

  profile.interactions = interactions;
  saveProfile(profile);

  submitUserEvent({
    type: 'userPreference',
    action,
    place: placeName,
    category,
    budgetLevel: place.budgetLevel,
    timeSpentSeconds,
    timestamp: new Date().toISOString(),
  }).catch(() => null);

  return profile;
};

export const recordSearchQuery = async (query) => {
  const text = String(query || '').trim();
  if (!text) return loadProfile();

  const profile = loadProfile();
  const recent = [...profile.searchHistory.filter((item) => item !== text), text].slice(-30);
  profile.searchHistory = recent;
  saveProfile(profile);

  submitUserEvent({
    type: 'search',
    query: text,
    timestamp: new Date().toISOString(),
  }).catch(() => null);

  return profile;
};

export const recordFavoritePlace = async (place) => {
  if (!place) return loadProfile();
  const profile = loadProfile();

  const placeName = place.place || place.name || '';
  if (!profile.favorites.includes(placeName)) {
    profile.favorites = [...profile.favorites, placeName];
  }

  if (place.category && !profile.likedCategories.includes(place.category)) {
    profile.likedCategories = [...profile.likedCategories, place.category];
  }

  saveProfile(profile);
  await updatePreferenceProfile({ action: 'favorite', place });
  return profile;
};

export const recordClick = async (place) => {
  if (!place) return loadProfile();
  const profile = loadProfile();
  const placeName = place.place || place.name || '';

  if (!profile.visitedPlaces.includes(placeName)) {
    profile.visitedPlaces = [...profile.visitedPlaces, placeName];
  }
  if (place.category && !profile.likedCategories.includes(place.category)) {
    profile.likedCategories = [...profile.likedCategories, place.category];
  }

  saveProfile(profile);
  await updatePreferenceProfile({ action: 'click', place });
  return profile;
};

export const recordSkip = async (place) => {
  if (!place) return loadProfile();
  const profile = loadProfile();
  await updatePreferenceProfile({ action: 'skip', place });
  return profile;
};

export const recordTimeSpent = async (place, seconds) => {
  if (!place || !seconds) return loadProfile();
  await updatePreferenceProfile({ action: 'timeSpent', place, timeSpentSeconds: seconds });
  return loadProfile();
};
