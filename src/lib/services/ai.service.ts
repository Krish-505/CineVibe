import { GoogleGenerativeAI } from '@google/generative-ai';
import { ParsedMood, TMDbMovie } from '@/types';

// Initialize Gemini API
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }
  return new GoogleGenerativeAI(apiKey);
};

export async function parseMoodToJSON(moodInput: string, refinements?: string[]): Promise<ParsedMood> {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      You are an expert movie recommender AI.
      Analyze the user's mood/input and return STRICT structured JSON to drive our recommendation engine.
      
      User Input: "${moodInput}"
      ${refinements && refinements.length > 0 ? `Refinements: ${refinements.join(', ')}` : ''}

      JSON Schema:
      {
        "primary_genres": [array of TMDB genre IDs that are ABSOLUTELY ESSENTIAL. E.g., for "crime thriller", use Crime and Thriller IDs. Limit 1-2],
        "secondary_genres": [array of TMDB genre IDs that are nice-to-have but not strict],
        "exact_keywords": [array of highly specific keywords and phrases extracted directly from the user's input, e.g., "fast-paced", "martial arts", "happy tears", "choreography"],
        "themes": [array of semantic themes extracted from input],
        "tone": "string describing tone, e.g. 'dark', 'lighthearted', 'intense'",
        "search_query": "A search query compiling the most important exact keywords for the TMDb search API (e.g., 'martial arts choreography')."
      }

      TMDB Genre Map (USE ONLY THESE IDs):
      Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80, Documentary: 99, Drama: 18, Family: 10751, Fantasy: 14, History: 36, Horror: 27, Music: 10402, Mystery: 9648, Romance: 10749, Sci-Fi: 878, Thriller: 53, War: 10752, Western: 37

      Return ONLY valid JSON. No markdown blocks.
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    const parsed: ParsedMood = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error('Error parsing mood with Gemini:', error);
    return {
      primary_genres: [],
      secondary_genres: [],
      themes: [],
      tone: 'neutral',
      search_query: ''
    };
  }
}

export async function generateMovieExplanations(
  moodInput: string,
  movies: TMDbMovie[]
): Promise<string[]> {
  try {
    if (movies.length === 0) return [];

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const movieData = movies.map((m, i) => `[ID: ${i}] Title: "${m.title}"\nPlot Overview: "${m.overview}"\n`).join('\n');

    const prompt = `
      You are an elite cinematic curator.
      The user requested movies based on this specific vibe: "${moodInput}"
      
      Write a HIGHLY SPECIFIC, completely unique 2-3 line explanation for EACH movie detailing exactly why its plot and tone match the user's mood.

      CRITICAL RULES:
      1. NO GENERIC PHRASES. DO NOT USE: "This movie fits perfectly...", "If you are looking for...", "A great choice for..."
      2. You MUST explicitly reference specific plot elements, character situations, or atmospheric details from the Plot Overview.
      3. Mention the specific emotional tone or pacing.
      4. EVERY explanation MUST sound completely different and start with a different sentence structure.

      Movies:
      ${movieData}

      Return a STRICT JSON array of strings, where each string is the explanation for the movie at that index ID.
      Return ONLY valid JSON array. No markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    const explanations: string[] = JSON.parse(text);
    
    if (!Array.isArray(explanations) || explanations.length !== movies.length) {
      throw new Error("Explanation count mismatch");
    }
    
    return explanations;
  } catch (error) {
    console.error('Error generating explanations with Gemini:', error);
    return movies.map(m => `The intricate narrative and thematic elements of ${m.title} perfectly capture the specific vibe you requested.`);
  }
}
