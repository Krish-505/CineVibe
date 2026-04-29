export interface TMDbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date: string;
  genre_ids: number[];
  overview: string;
  popularity: number;
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
  genres: number[];
  pace: 'slow' | 'medium' | 'fast' | '';
  tone: 'light' | 'dark' | 'neutral' | '';
  avoid: string[];
  runtime: 'short' | 'medium' | 'long' | '';
  isAnime: boolean;
}

export interface MovieRecommendation extends TMDbMovie {
  explanation: string;
  trailer_key?: string;
  streaming_info?: StreamingInfo;
}

export interface MoodRequest {
  mood: string;
  refinements?: string[];
}
