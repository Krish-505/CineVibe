import { TMDbMovie, StreamingInfo } from '@/types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// We'll use the API key in headers to authenticate
const getHeaders = () => {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    throw new Error('TMDb API Key is missing. Check your environment variables.');
  }
  // If the key is a Bearer token (from TMDB Read Access Token)
  if (apiKey.length > 50) {
    return {
      accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };
  }
  return {
    accept: 'application/json',
  };
};

// URL helper for standard query param auth fallback
const getUrl = (path: string, params: Record<string, string> = {}) => {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
  const searchParams = new URLSearchParams(params);
  // Add api_key param if it's the short v3 key instead of a bearer token
  if (apiKey.length <= 50) {
    searchParams.append('api_key', apiKey);
  }
  return `${TMDB_BASE_URL}${path}?${searchParams.toString()}`;
};

export async function discoverMovies(params: Record<string, string>): Promise<TMDbMovie[]> {
  try {
    const url = getUrl('/discover/movie', {
      include_adult: 'false',
      include_video: 'false',
      language: 'en-US',
      ...params,
    });

    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      console.error('TMDB Discover Error:', await res.text());
      return [];
    }

    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Error in discoverMovies:', error);
    return [];
  }
}

export async function getMovieTrailer(movieId: number): Promise<string | undefined> {
  try {
    const url = getUrl(`/movie/${movieId}/videos`, { language: 'en-US' });
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!res.ok) return undefined;

    const data = await res.json();
    const trailers = data.results?.filter(
      (v: any) => v.site === 'YouTube' && v.type === 'Trailer'
    );
    
    // Fallback to teasers if no trailer
    if (!trailers || trailers.length === 0) {
      const teasers = data.results?.filter((v: any) => v.site === 'YouTube');
      return teasers?.[0]?.key;
    }

    return trailers[0]?.key;
  } catch (error) {
    console.error('Error in getMovieTrailer:', error);
    return undefined;
  }
}

export async function getWatchProviders(movieId: number): Promise<StreamingInfo | undefined> {
  try {
    const url = getUrl(`/movie/${movieId}/watch/providers`);
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!res.ok) return undefined;

    const data = await res.json();
    // Assuming US region for simplicity, can be expanded later
    return data.results?.US;
  } catch (error) {
    console.error('Error in getWatchProviders:', error);
    return undefined;
  }
}

export async function searchMovies(query: string): Promise<TMDbMovie[]> {
  try {
    const url = getUrl('/search/movie', {
      query,
      include_adult: 'false',
      language: 'en-US',
      page: '1',
    });

    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      next: { revalidate: 86400 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Error in searchMovies:', error);
    return [];
  }
}
