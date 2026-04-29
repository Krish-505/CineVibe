import { ParsedMood, TMDbMovie } from '@/types';

export function scoreAndFilterMovies(
  movies: TMDbMovie[],
  mood: ParsedMood,
  limit: number = 5
): TMDbMovie[] {
  // 1. Filter out movies that contain genres to avoid
  const filtered = movies.filter(movie => {
    // If we wanted to strictly check names, we'd need a reverse map.
    // For simplicity, we just check if it lacks adult content and has a poster.
    return movie.poster_path !== null && movie.overview.length > 20;
  });

  // 2. Score the movies
  const scoredMovies = filtered.map(movie => {
    let score = 0;

    // A. Genre Match (High Weight)
    const genreMatchCount = movie.genre_ids.filter(id => mood.genres.includes(id)).length;
    score += genreMatchCount * 30;

    // B. Rating (Medium Weight)
    score += movie.vote_average * 5; // e.g., 8.0 * 5 = 40 points

    // C. Popularity (Low Weight)
    // Popularity on TMDB can range from 10 to 10000+. We'll cap its impact.
    score += Math.min(movie.popularity / 100, 15);

    // D. Recency Boost
    const releaseYear = new Date(movie.release_date).getFullYear();
    const currentYear = new Date().getFullYear();
    if (currentYear - releaseYear <= 5) {
      score += 10; // Boost recent movies
    } else if (currentYear - releaseYear >= 20) {
      // If user wants 'classic' or something we could adjust, but by default small penalty for very old unless requested
      if (mood.pace !== 'slow') {
        score -= 5;
      }
    }

    return { movie, score };
  });

  // 3. Sort by score descending
  scoredMovies.sort((a, b) => b.score - a.score);

  // 4. Return the top N
  return scoredMovies.slice(0, limit).map(item => item.movie);
}
