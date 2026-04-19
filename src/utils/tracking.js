import { getUserProfile, updateUserProfile } from './userProfile';
import { updateTrending } from './trending';

const uniquePush = (arr, value) => {
  if (!value) return arr;
  if (arr.includes(value)) return arr;
  return [...arr, value];
};

export const trackSearch = (query) => {
  const value = (query || '').trim();
  if (!value) return;

  const profile = getUserProfile();
  const recent = [...profile.searchHistory, value].slice(-30);
  updateUserProfile({ searchHistory: recent });
};

export const trackClick = (place) => {
  if (!place) return;

  const placeName = place.name || place.place || '';
  const category = place.category || '';
  const profile = getUserProfile();

  updateUserProfile({
    visitedPlaces: uniquePush(profile.visitedPlaces, placeName),
    likedCategories: uniquePush(profile.likedCategories, category),
  });

  updateTrending(placeName);
};

export const trackFavorite = (place) => {
  if (!place) return;

  const placeName = place.name || place.place || '';
  const profile = getUserProfile();

  updateUserProfile({
    favorites: uniquePush(profile.favorites, placeName),
  });

  updateTrending(placeName);
};