import { TMDbMovie, StreamingInfo, CastMember, MediaItem } from '@/types';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

async function fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY || '',
    ...params,
  });

  const response = await fetch(`${BASE_URL}${endpoint}?${queryParams.toString()}`, {
    next: { revalidate: 3600 } // Cache for 1 hour to stay fresh but fast
  });

  if (!response.ok) {
    throw new Error(`TMDb API Error: ${response.statusText}`);
  }

  return response.json();
}

// Normalized Transformer
export function normalizeMedia(item: TMDbMovie, type: 'movie' | 'tv'): MediaItem {
  return {
    id: item.id,
    type,
    title: item.title || item.name || 'Unknown Title',
    release_date: item.release_date || item.first_air_date || '',
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    overview: item.overview,
    vote_average: item.vote_average,
    vote_count: item.vote_count,
    popularity: item.popularity,
    genre_ids: item.genre_ids || [],
    original_language: item.original_language
  };
}

// MOVIE ENDPOINTS
export async function discoverMovies(params: Record<string, string> = {}): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: TMDbMovie[] }>('/discover/movie', params);
  return data.results.map(m => normalizeMedia(m, 'movie'));
}

export async function searchMovies(query: string, params: Record<string, string> = {}): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: TMDbMovie[] }>('/search/movie', { query, ...params });
  return data.results.map(m => normalizeMedia(m, 'movie'));
}

export async function getTrendingMovies(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: TMDbMovie[] }>('/trending/movie/day');
  return data.results.map(m => normalizeMedia(m, 'movie'));
}

// TV ENDPOINTS
export async function discoverTV(params: Record<string, string> = {}): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: TMDbMovie[] }>('/discover/tv', params);
  return data.results.map(m => normalizeMedia(m, 'tv'));
}

export async function searchTV(query: string, params: Record<string, string> = {}): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: TMDbMovie[] }>('/search/tv', { query, ...params });
  return data.results.map(m => normalizeMedia(m, 'tv'));
}

export async function getTrendingTV(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: TMDbMovie[] }>('/trending/tv/day');
  return data.results.map(m => normalizeMedia(m, 'tv'));
}

// COMMON ENDPOINTS
export async function getTrailer(id: number, type: 'movie' | 'tv'): Promise<string | undefined> {
  try {
    const data = await fetchFromTMDB<{ results: any[] }>(`/${type}/${id}/videos`);
    const trailer = data.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
    return trailer?.key;
  } catch {
    return undefined;
  }
}

export async function getWatchProviders(id: number, type: 'movie' | 'tv'): Promise<StreamingInfo | undefined> {
  try {
    const data = await fetchFromTMDB<{ results: Record<string, any> }>(`/${type}/${id}/watch/providers`);
    return data.results['US']; // Defaulting to US for now, could be dynamic
  } catch {
    return undefined;
  }
}

export async function getCredits(id: number, type: 'movie' | 'tv'): Promise<CastMember[]> {
  try {
    const data = await fetchFromTMDB<{ cast: CastMember[] }>(`/${type}/${id}/credits`);
    return data.cast.slice(0, 10);
  } catch {
    return [];
  }
}

export async function getSimilar(id: number, type: 'movie' | 'tv'): Promise<MediaItem[]> {
  try {
    const data = await fetchFromTMDB<{ results: TMDbMovie[] }>(`/${type}/${id}/similar`);
    return data.results.slice(0, 8).map(m => normalizeMedia(m, type));
  } catch {
    return [];
  }
}

export async function getDetails(id: number, type: 'movie' | 'tv'): Promise<any> {
  return await fetchFromTMDB<any>(`/${type}/${id}`);
}
