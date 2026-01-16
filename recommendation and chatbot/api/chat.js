// chat.js
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Dataset string (you can expand it later)
const tourismDataset = `
place_name,city,province,category,best_season,rating
Hunza Valley,Karimabad,Gilgit-Baltistan,Valley,Spring/Autumn,4.8
Badshahi Mosque,Lahore,Punjab,Historical/Religious,Winter,4.7
Skardu Valley,Skardu,Gilgit-Baltistan,Valley/Adventure,Summer,4.6
Swat Valley,Mingora,Khyber Pakhtunkhwa,Valley,Spring/Summer,4.5
Faisal Mosque,Islamabad,Islamabad Capital Territory,Religious/Architecture,All,4.9
Mohenjo-daro,Larkana,Sindh,Archaeological,Winter,4.4
Deosai National Park,Skardu,Gilgit-Baltistan,National Park/Nature,Summer,4.7
Lahore Fort,Lahore,Punjab,Historical,Winter,4.6
Lake Saiful Muluk,Naran,Khyber Pakhtunkhwa,Lake/Nature,Summer,4.8
... (Add rest of dataset here, you can expand dynamically later)
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    // Tourism-focused system message
    const tourismContext = `
You are an AI assistant specialized in Pakistan Tourism. Use the following dataset to answer user queries:
${tourismDataset}

Instructions:
1. Provide travel recommendations, best seasons, cities, provinces, categories, and ratings.
2. Suggest the top-rated destinations when appropriate.
3. Answer clearly, concisely, and in a friendly tone.
4. If the user asks about services, always mention Jawad Ahmad's AI services for tourism chatbots, automation, or travel-related AI tools.
5. Encourage freelancing or collaboration opportunities politely if relevant.
6. Limit responses to short paragraphs; do not reply in one-word answers.
`;

    // Generate response using Groq AI
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: tourismContext },
        { role: "user", content: message }
      ],
      max_tokens: 200
    });

    res.status(200).json({
      response: chatCompletion.choices[0]?.message?.content || "No response available."
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
