import { NextResponse } from 'next/server';
import { parseMoodToJSON, generateMovieExplanations } from '@/lib/services/ai.service';
import { discoverMovies, searchMovies, getTrendingMovies, discoverTV, searchTV, getTrendingTV, getTrailer, getWatchProviders } from '@/lib/services/tmdb.service';
import { scoreAndFilterMovies } from '@/lib/services/scoring.service';
import { MovieRecommendation, MediaItem, ActiveFilters } from '@/types';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mood, refinements = [], filters, isPerfectPick = false } = body;

    if (!mood && !filters) {
      return NextResponse.json({ error: 'Mood or filters are required' }, { status: 400 });
    }

    const fullMoodText = `${mood || ''} ${refinements.join(' ')}`;
    const activeFilters = filters as ActiveFilters;
    const contentType = activeFilters?.contentType || 'both'; // 'movie', 'tv', 'both'

    // 1. Parse Mood Semantic Intent
    let parsedMood = { primary_genres: [], secondary_genres: [], themes: [], tone: 'neutral', search_query: '' } as any;
    if (fullMoodText.trim()) {
      parsedMood = await parseMoodToJSON(fullMoodText);
    }
    
    // 2. Multi-Source Fetching Strategy (100+ items)
    let discoveredItems: MediaItem[] = [];
    
    let discoverParams: Record<string, string> = {
      sort_by: 'vote_average.desc',
      'vote_count.gte': '200', 
    };

    // If AI found strict genres, use them
    if (parsedMood.primary_genres.length > 0) {
      // Use OR logic for TMDb if multiple primary genres to avoid overly strict API failure.
      // The local scoring service will enforce the "at least one" rule strictly.
      discoverParams.with_genres = parsedMood.primary_genres.join('|'); 
    }
    
    // Industry Language mapping
    if (activeFilters?.language) {
      if (activeFilters.language === 'indian') {
        discoverParams.with_original_language = 'hi|ta|te';
      } else if (activeFilters.language === 'ja') {
        discoverParams.with_original_language = 'ja';
        discoverParams.with_genres = discoverParams.with_genres ? `${discoverParams.with_genres},16` : '16';
      } else {
        discoverParams.with_original_language = activeFilters.language;
      }
    }

    // Prepare async fetch calls based on Content Type
    const fetchPromises: Promise<MediaItem[]>[] = [];
    
    // Random pages to ensure diversity
    const randomPageStart = Math.floor(Math.random() * 5) + 1;
    const pages = [randomPageStart, randomPageStart + 1, randomPageStart + 2];

    if (contentType === 'movie' || contentType === 'both') {
      pages.forEach(p => fetchPromises.push(discoverMovies({ ...discoverParams, page: p.toString() }).catch(() => [])));
      fetchPromises.push(getTrendingMovies().catch(() => []));
      if (parsedMood.search_query) {
        fetchPromises.push(searchMovies(parsedMood.search_query).catch(() => []));
      }
    }

    if (contentType === 'tv' || contentType === 'both') {
      pages.forEach(p => fetchPromises.push(discoverTV({ ...discoverParams, page: p.toString() }).catch(() => [])));
      fetchPromises.push(getTrendingTV().catch(() => []));
      if (parsedMood.search_query) {
        fetchPromises.push(searchTV(parsedMood.search_query).catch(() => []));
      }
    }

    const pagesResults = await Promise.all(fetchPromises);
    discoveredItems = pagesResults.flat();

    // Deduplicate Heavy (Anti-Repetition)
    const getUnique = (arr: MediaItem[]) => {
      const map = new Map();
      arr.forEach(m => map.set(m.id, m));
      return Array.from(map.values());
    };
    discoveredItems = getUnique(discoveredItems);

    // Initial Scoring & Filtering
    // If Perfect Pick is true, we ONLY want 1. Otherwise, return 5.
    const limit = isPerfectPick ? 1 : 5;
    let selectedItems = scoreAndFilterMovies(discoveredItems, parsedMood, fullMoodText, activeFilters, limit, isPerfectPick);

    // Adaptive Fetching (If strict filtering wiped out our pool)
    if (selectedItems.length < limit) {
      console.log('Adaptive fetching: Insufficient results after strict filtering. Fetching more...');
      const morePages = [randomPageStart + 3, randomPageStart + 4, randomPageStart + 5];
      const morePromises: Promise<MediaItem[]>[] = [];
      
      if (contentType === 'movie' || contentType === 'both') {
        morePages.forEach(p => morePromises.push(discoverMovies({ ...discoverParams, page: p.toString() }).catch(() => [])));
      }
      if (contentType === 'tv' || contentType === 'both') {
         morePages.forEach(p => morePromises.push(discoverTV({ ...discoverParams, page: p.toString() }).catch(() => [])));
      }
      
      const moreResults = await Promise.all(morePromises);
      discoveredItems = getUnique([...discoveredItems, ...moreResults.flat()]);
      
      // Rescore with larger pool
      selectedItems = scoreAndFilterMovies(discoveredItems, parsedMood, fullMoodText, activeFilters, limit, isPerfectPick);
    }

    if (selectedItems.length === 0) {
      return NextResponse.json({ error: 'No exact matches found. Try relaxing your filters or mood description.' }, { status: 404 });
    }

    // 4. Enrich with Explanations, Trailers, and Providers
    const explanationsPromise = generateMovieExplanations(fullMoodText, selectedItems);

    const enrichmentPromises = selectedItems.map(async (item) => {
      const [trailer_key, streaming_info] = await Promise.all([
        getTrailer(item.id, item.type),
        getWatchProviders(item.id, item.type),
      ]);
      return { trailer_key, streaming_info };
    });

    const [explanations, enrichments] = await Promise.all([
      explanationsPromise,
      Promise.all(enrichmentPromises),
    ]);

    // 5. Combine everything
    const recommendations: MovieRecommendation[] = selectedItems.map((item, index) => ({
      ...item,
      explanation: explanations[index] || `A cinematic masterpiece matching your requested vibe.`,
      trailer_key: enrichments[index].trailer_key,
      streaming_info: enrichments[index].streaming_info,
    }));

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error in /api/recommend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
