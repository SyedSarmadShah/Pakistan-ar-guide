import { rankPlaces } from './recommendationEngine';

const USER_EVENTS_KEY = 'apiUserEvents';
const RECOMMENDATION_CACHE_KEY = 'apiRecommendationCache';

const safeJson = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const storeLocalEvent = (event) => {
  const stored = JSON.parse(localStorage.getItem(USER_EVENTS_KEY) || '[]');
  localStorage.setItem(USER_EVENTS_KEY, JSON.stringify([...stored, event]));
  return event;
};

export const submitUserEvent = async (event) => {
  const payload = { ...event, timestamp: new Date().toISOString() };
  try {
    const response = await fetch('/api/user-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return storeLocalEvent(payload);
    }

    return safeJson(response) || payload;
  } catch (error) {
    return storeLocalEvent(payload);
  }
};

export const fetchRecommendations = async ({ places, userProfile, context }) => {
  const requestPayload = {
    userProfile,
    context,
    fallback: true,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Backend unavailable');
    }

    const data = await safeJson(response);
    if (data && Array.isArray(data.recommendations)) {
      return { data: data.recommendations };
    }
  } catch (error) {
    // Backend not running or timed out — fall back to local ranking
  }

  const ranked = rankPlaces(places, userProfile, context);
  localStorage.setItem(RECOMMENDATION_CACHE_KEY, JSON.stringify(ranked));
  return { data: ranked };
};

export const getStoredUserEvents = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_EVENTS_KEY) || '[]');
  } catch {
    return [];
  }
};
