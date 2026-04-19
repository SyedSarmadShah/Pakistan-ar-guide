const TRENDING_KEY = 'trending';

const readTrending = () => {
  try {
    return JSON.parse(localStorage.getItem(TRENDING_KEY) || '{}');
  } catch (error) {
    return {};
  }
};

export const updateTrending = (placeName) => {
  if (!placeName) return;
  const trending = readTrending();
  trending[placeName] = (trending[placeName] || 0) + 1;
  localStorage.setItem(TRENDING_KEY, JSON.stringify(trending));
};

export const getTrendingScore = (placeName) => {
  const trending = readTrending();
  return trending[placeName] || 0;
};