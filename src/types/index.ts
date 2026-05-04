export interface TMDbMovie {
  id: number;
  title?: string;
  name?: string; // For TV
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string; // For TV
  genre_ids: number[];
  overview: string;
  popularity: number;
  original_language: string;
}

export interface MediaItem {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date: string;
  genre_ids: number[];
  overview: string;
  popularity: number;
  original_language: string;
  explanation?: string;
  trailer_key?: string;
  streaming_info?: StreamingInfo;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface StreamingInfo {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface ParsedMood {
  primary_genres: number[];
  secondary_genres: number[];
  exact_keywords?: string[];
  themes: string[];
  tone: string;
  search_query: string;
}

export interface ActiveFilters {
  contentType?: 'movie' | 'tv' | 'both';
  language?: string;
  genre?: number;
  moodEmoji?: string;
  runtime?: 'short' | 'long';
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}
