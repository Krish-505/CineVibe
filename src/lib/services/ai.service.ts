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

// Genre mapping for TMDb
const GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  scifi: 878,
  'sci-fi': 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

export async function parseMoodToJSON(moodInput: string, refinements?: string[]): Promise<ParsedMood> {
  try {
    const genAI = getGenAI();
    // Using gemini-1.5-flash for faster response
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = `
      You are an expert movie recommender AI.
      Analyze the user's mood and return STRICT structured JSON with movie filter preferences.
      
      User's Mood: "${moodInput}"
      ${refinements && refinements.length > 0 ? `User's Refinements: ${refinements.join(', ')}` : ''}

      JSON Schema requirement:
      {
        "genres": [array of TMDB genre IDs (numbers) that match the mood, select 1 to 3 IDs],
        "pace": "slow" | "medium" | "fast" | "",
        "tone": "light" | "dark" | "neutral" | "",
        "avoid": [array of genre names or keywords to avoid],
        "runtime": "short" | "medium" | "long" | "",
        "isAnime": boolean
      }

      TMDB Genre Map (use these IDs):
      Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80, Documentary: 99, Drama: 18, Family: 10751, Fantasy: 14, History: 36, Horror: 27, Music: 10402, Mystery: 9648, Romance: 10749, Sci-Fi: 878, Thriller: 53, War: 10752, Western: 37

      Return ONLY valid JSON. No markdown formatting blocks, no extra text.
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Clean up potential markdown blocks if AI ignored instruction
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    const parsed: ParsedMood = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error('Error parsing mood with Gemini:', error);
    // Fallback logic
    return {
      genres: [28, 12, 35], // Action, Adventure, Comedy
      pace: 'medium',
      tone: 'neutral',
      avoid: [],
      runtime: '',
      isAnime: false
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const movieData = movies.map((m, i) => `[${i}] Title: ${m.title}, Overview: ${m.overview}, Genres: ${m.genre_ids.join(', ')}`).join('\n');

    const prompt = `
      You are an expert movie recommender AI.
      The user is looking for a movie based on this mood/request: "${moodInput}"
      
      I have selected the following movies. For EACH movie, write a 2-3 line, human-like, specific explanation of WHY it perfectly matches their mood. 
      Do NOT write a generic summary. Explain the VIBE and why it fits.

      Movies:
      ${movieData}

      Return a STRICT JSON array of strings, where each string is the explanation for the movie at that index.
      Example: ["explanation for movie 0", "explanation for movie 1", ...]
      
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
    return explanations;
  } catch (error) {
    console.error('Error generating explanations with Gemini:', error);
    // Fallback explanations
    return movies.map(m => `This movie features themes and a tone that align well with what you're looking for right now.`);
  }
}
