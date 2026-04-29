import { NextResponse } from 'next/server';
import { parseMoodToJSON, generateMovieExplanations } from '@/lib/services/ai.service';
import { discoverMovies, getMovieTrailer, getWatchProviders } from '@/lib/services/tmdb.service';
import { scoreAndFilterMovies } from '@/lib/services/scoring.service';
import { MovieRecommendation, TMDbMovie } from '@/types';

export const maxDuration = 60; // Allow longer execution time for multiple API calls

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mood, refinements = [], isPerfectPick = false } = body;

    if (!mood) {
      return NextResponse.json({ error: 'Mood is required' }, { status: 400 });
    }

    // 1. Parse Mood
    const parsedMood = await parseMoodToJSON(mood, refinements);
    
    // Default to some genres if none parsed
    const genreIds = parsedMood.genres.length > 0 ? parsedMood.genres : [28, 12, 35]; 

    // 2. Discover Movies from TMDB
    let discoveredMovies: TMDbMovie[] = [];
    
    // We fetch a few pages to get a good pool of movies
    for (let page = 1; page <= 2; page++) {
      const results = await discoverMovies({
        with_genres: genreIds.join(','),
        sort_by: 'popularity.desc',
        page: page.toString(),
        'vote_average.gte': '6.0',
        'vote_count.gte': '100',
      });
      discoveredMovies = [...discoveredMovies, ...results];
    }

    // Fallback: if very few results, relax constraints
    if (discoveredMovies.length < 5) {
      const fallbackResults = await discoverMovies({
        with_genres: genreIds.slice(0, 1).join(','), // Just use the first genre
        sort_by: 'popularity.desc',
        page: '1',
      });
      discoveredMovies = [...discoveredMovies, ...fallbackResults];
    }

    // 3. Score and Filter
    const targetCount = isPerfectPick ? 1 : 5;
    const selectedMovies = scoreAndFilterMovies(discoveredMovies, parsedMood, targetCount);

    if (selectedMovies.length === 0) {
      return NextResponse.json({ error: 'No movies found matching criteria' }, { status: 404 });
    }

    // 4. Enrich with Explanations, Trailers, and Providers
    // Run explanations in parallel with TMDB enrichment
    const explanationsPromise = generateMovieExplanations(
      `${mood} ${refinements.length > 0 ? '(Refinements: ' + refinements.join(', ') + ')' : ''}`, 
      selectedMovies
    );

    const enrichmentPromises = selectedMovies.map(async (movie) => {
      const [trailer_key, streaming_info] = await Promise.all([
        getMovieTrailer(movie.id),
        getWatchProviders(movie.id),
      ]);
      return { trailer_key, streaming_info };
    });

    const [explanations, enrichments] = await Promise.all([
      explanationsPromise,
      Promise.all(enrichmentPromises),
    ]);

    // 5. Combine everything
    const recommendations: MovieRecommendation[] = selectedMovies.map((movie, index) => ({
      ...movie,
      explanation: explanations[index] || 'A great match for your current mood.',
      trailer_key: enrichments[index].trailer_key,
      streaming_info: enrichments[index].streaming_info,
    }));

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error in /api/recommend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
