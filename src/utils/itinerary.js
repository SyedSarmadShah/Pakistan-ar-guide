import { rankPlaces } from './recommendationEngine';

const toRad = (v) => (v * Math.PI) / 180;
const haversineKm = (a, b) => {
  if (!a || !b || a.lat == null || b.lat == null) return Infinity;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const aa = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
};

export function generateItinerary(options = {}, places = [], userProfile = {}, context = {}) {
  const days = Math.max(1, Number(options.days) || 3);
  const budgetLevel = options.budgetLevel || '';
  const travelStyle = (options.travelStyle || '').toLowerCase().trim();
  const perDayCapacity = Math.max(1, Number(options.perDayCapacity) || 3);
  const defaultDurationHours = Number(options.defaultDurationHours) || 2;

  // Friendly travel-style -> category aliases (lowercase)
  const styleAliases = {
    family: ['valley', 'park', 'lake', 'historical', 'zoo', 'garden'],
    adventure: ['hiking', 'trek', 'adventure', 'rafting', 'mountain'],
    history: ['historical', 'heritage', 'monument', 'museum'],
    nature: ['valley', 'national park', 'lake', 'waterfall', 'forest'],
    food: ['food', 'market', 'bazaar', 'street food', 'cafe', 'restaurant'],
    religious: ['mosque', 'shrine', 'temple', 'religious', 'gurdwara'],
  };

  // Start with full set, apply budget filter first
  let candidates = places.slice();
  if (budgetLevel) {
    candidates = candidates.filter(p => String(p.budgetLevel || '').toLowerCase() === String(budgetLevel).toLowerCase());
  }

  // Apply travelStyle mapping: try aliases first, otherwise substring match on category
  if (travelStyle) {
    const aliasList = styleAliases[travelStyle];
    if (Array.isArray(aliasList)) {
      const aliasSet = new Set(aliasList.map(a => a.toLowerCase()));
      candidates = candidates.filter(p => aliasSet.has((p.category || '').toLowerCase()));
    } else {
      // fallback: substring match
      candidates = candidates.filter(p => (p.category || '').toLowerCase().includes(travelStyle));
    }
  }

  // Rank the filtered candidates
  let ranked = rankPlaces(candidates, userProfile || {}, { ...context, currentSeason: context.currentSeason || '' });

  // If filters removed everything, fallback to ranked full list (so the UI gets recommendations)
  let fallbackUsed = false;
  if (!ranked || ranked.length === 0) {
    fallbackUsed = true;
    ranked = rankPlaces(places, userProfile || {}, { ...context, currentSeason: context.currentSeason || '' });
  }

  // Limit by days * perDayCapacity
  const maxPlaces = Math.min(ranked.length, days * perDayCapacity);
  const selected = ranked.slice(0, maxPlaces).map((p, idx) => ({ ...p, selectedRank: idx + 1 }));

  // Build day-by-day itinerary using greedy nearest selection per day
  const itinerary = Array.from({ length: days }, () => []);
  const assigned = new Set();
  const basePoint = context.userLocation || (selected[0] ? { lat: selected[0].lat, lon: selected[0].lon } : null);

  for (let day = 0; day < days; day++) {
    let remainingSlots = perDayCapacity;
    let currentPoint = basePoint;
    while (remainingSlots > 0) {
      let bestIdx = -1;
      let bestScore = Infinity;
      for (let i = 0; i < selected.length; i++) {
        if (assigned.has(i)) continue;
        const p = selected[i];
        const loc = { lat: p.lat, lon: p.lon };
        const dist = currentPoint ? haversineKm(currentPoint, loc) : (p.popularity ? 0 : 1000);
        const score = (dist || 0) * 1.0 + (p.selectedRank || 1000) * 0.5;
        if (score < bestScore) {
          bestScore = score;
          bestIdx = i;
        }
      }
      if (bestIdx === -1) break;
      assigned.add(bestIdx);
      const place = selected[bestIdx];
      itinerary[day].push({
        place: place.place || place.name || '',
        city: place.city || '',
        lat: place.lat,
        lon: place.lon,
        estDurationHours: place.estDurationHours || defaultDurationHours,
        notes: '',
        recommendedScore: place.score || 0,
      });
      currentPoint = { lat: place.lat, lon: place.lon };
      remainingSlots--;
    }
  }

  return {
    meta: {
      days,
      generatedAt: new Date().toISOString(),
      options,
      sourceCount: ranked.length,
      fallbackUsed,
    },
    days: itinerary.map((items, idx) => ({ day: idx + 1, items })),
  };
}

function downloadBlob(filename, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportItineraryJSON(itinerary, filename = 'itinerary.json') {
  downloadBlob(filename, 'application/json', JSON.stringify(itinerary, null, 2));
}

export function exportItineraryICS(itinerary, filename = 'itinerary.ics') {
  const pad = (n) => String(n).padStart(2, '0');
  const dtFormat = (d) => {
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z';
  };

  const events = [];
  const startBase = new Date();
  for (let d = 0; d < (itinerary.days || []).length; d++) {
    const day = itinerary.days[d];
    for (let i = 0; i < (day.items || []).length; i++) {
      const place = day.items[i];
      const evStart = new Date(startBase);
      evStart.setDate(startBase.getDate() + d);
      evStart.setHours(9 + i * 2, 0, 0, 0);
      const evEnd = new Date(evStart);
      evEnd.setHours(evStart.getHours() + (place.estDurationHours || 2));
      events.push(
        `BEGIN:VEVENT\nDTSTAMP:${dtFormat(new Date())}\nDTSTART:${dtFormat(evStart)}\nDTEND:${dtFormat(evEnd)}\nSUMMARY:${place.place} — ${place.city}\nDESCRIPTION:Estimated duration ${place.estDurationHours || 2}h\nEND:VEVENT`
      );
    }
  }

  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Pakistan AR Guide//EN\nCALSCALE:GREGORIAN\n${events.join('\n')}\nEND:VCALENDAR`;
  downloadBlob(filename, 'text/calendar;charset=utf-8', ics);
}
