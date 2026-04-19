const PROFILE_KEY = 'userProfile';

const defaultProfile = () => ({
  likedCategories: [],
  visitedPlaces: [],
  searchHistory: [],
  favorites: [],
});

export const getUserProfile = () => {
  try {
    const profile = localStorage.getItem(PROFILE_KEY);
    if (!profile) {
      const next = defaultProfile();
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      return next;
    }

    const parsed = JSON.parse(profile);
    return { ...defaultProfile(), ...parsed };
  } catch (error) {
    const next = defaultProfile();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    return next;
  }
};

export const updateUserProfile = (updates) => {
  const profile = getUserProfile();
  const updated = { ...profile, ...updates };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  return updated;
};