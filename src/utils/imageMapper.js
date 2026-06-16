/**
 * Maps place names to local image paths from public/images/locations/
 * Handles normalization of place names to match file names
 */

// Mapping of normalized place names to actual image filenames
const imageFileMap = {
  "altit fort": "Altit Fort.PNG",
  "ansoo lake": "Ansoo Lake.PNG",
  "attabad lake": "Attabad Lake.jpg",
  "ayubia national park": "Ayubia National Park.PNG",
  "badshahi mosque": "Badshahi Mosque.jpg",
  "baltit fort": "Baltit Fort.PNG",
  "banjosa lake": "Banjosa Lake.PNG",
  "bhir mound": "Bhir Mound.PNG",
  "chitral valley": "Chitral Valley.PNG",
  "daman-e-koh": "Daman-e-Koh.PNG",
  "deosai national park": "Deosai National Park.jpg",
  "derawar fort": "Derawar Fort.PNG",
  "dharmarajika stupa": "Dharmarajika Stupa.PNG",
  "dunga gali": "Dunga Gali.PNG",
  "f-9 park": "F-9 Park.PNG",
  "fairy meadows": "Fairy Meadows.PNG",
  "faisal mosque": "Faisal Mosque.jpg",
  "hiran minar": "Hiran Minar.PNG",
  "hunza valley": "Hunza Valley.jpg",
  "jandial temple": "Jandial Temple.PNG",
  "japanese park": "Japanese Park.PNG",
  "jaulian monastery": "Jaulian Monastery.PNG",
  "kalam valley": "Kalam Valley.PNG",
  "kallar kahar": "Kallar Kahar.PNG",
  "katas raj temples": "Katas Raj Temples.jpg",
  "khanpur dam": "Khanpur Dam.PNG",
  "khunjerab pass": "Khunjerab Pass.PNG",
  "lahore fort": "Lahore Fort.jpg",
  "lake saiful muluk": "Lake Saiful Muluk.jpg",
  "lok virsa museum": "Lok Virsa Museum.PNG",
  "mahabat khan mosque": "Mahabat Khan Mosque.PNG",
  "makli necropolis": "Makli Necropolis.PNG",
  "malam jabba": "Malam Jabba.PNG",
  "margalla hills national park": "Margalla Hills National Park.PNG",
  "minar-e-pakistan": "Minar-e-Pakistan.jpg",
  "mohenjo-daro": "Mohenjo-daro.jpg",
  "mohra moradu": "Mohra Moradu.PNG",
  "mukeshpuri": "Mukeshpuri.PNG",
  "murree hills": "Murree Hills.PNG",
  "naltar valley": "Naltar Valley.jpg",
  "nathia gali": "Nathia Gali.PNG",
  "neela wahn": "Neela Wahn.PNG",
  "pakistan monument": "Pakistan Monument.PNG",
  "passu cones": "Passu Cones.PNG",
  "patriata chair lift": "Patriata Chair Lift.PNG",
  "pir sohawa": "Pir Sohawa.PNG",
  "rakaposhi base camp": "Rakaposhi Base Camp.PNG",
  "rawal lake": "Rawal Lake.PNG",
  "rohtas fort": "Rohtas Fort.jpg",
  "rose and jasmine garden": "Rose and Jasmine Garden.PNG",
  "saidpur village": "Saidpur Village.PNG",
  "shah allah ditta caves": "Shah Allah Ditta Caves.PNG",
  "shakarparian hills": "Shakarparian Hills.PNG",
  "shalimar gardens": "Shalimar Gardens.jpg",
  "shogran": "Shogran.PNG",
  "sirkap ruins": "Sirkap Ruins.PNG",
  "skardu valley": "Skardu Valley.jpg",
  "soon valley": "Soon Valley.PNG",
  "swaik lake": "Swaik Lake.PNG",
  "swat valley": "Swat Valley.jpg",
  "takht-i-bahi": "Takht-i-Bahi.PNG",
  "taxila museum": "Taxila Museum.PNG",
  "taxila": "Taxila Museum.PNG",
  "thandiani": "Thandiani.PNG",
  "wagah border": "Wagah Border.PNG",
  "wazir khan mosque": "Wazir Khan Mosque.jpg",
  "ziarat": "Ziarat.jpg",
};

/**
 * Get the image path for a place
 * @param {string} placeName - The name of the place
 * @returns {string} - The image path (local if found, fallback to generic mountain image)
 */
export const getPlaceImage = (placeName) => {
  if (!placeName) {
    return "/images/locations/Hunza Valley.jpg"; // Fallback
  }

  const normalized = placeName.toLowerCase().trim();
  const filename = imageFileMap[normalized];

  if (filename) {
    return `/images/locations/${filename}`;
  }

  // Fallback to a generic location image
  return "/images/locations/Hunza Valley.jpg";
};

export default getPlaceImage;
