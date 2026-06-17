export const getCurrentSeason = () => {
  const month = new Date().getMonth();

  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Autumn';
  return 'Winter';
};

/**
 * Request the user's GPS position.
 * Resolves with { lat, lon } on success, or { error: 'denied' | 'timeout' | 'unavailable' } on failure.
 * A 15-second timeout gives the browser permission prompt enough time to appear and be answered.
 */
export const getUserLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ error: 'unavailable' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => {
        // err.code: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
        if (err.code === 1) {
          resolve({ error: 'denied' });
        } else if (err.code === 3) {
          resolve({ error: 'timeout' });
        } else {
          resolve({ error: 'unavailable' });
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  });
};

export const mapWeatherToType = (weatherMain = '') => {
  if (weatherMain.includes('Snow')) return 'snowy';
  if (weatherMain.includes('Rain')) return 'rainy';
  if (weatherMain.includes('Cloud')) return 'cloudy';
  if (weatherMain.includes('Clear')) return 'sunny';
  return 'normal';
};