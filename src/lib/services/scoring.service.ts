import { ParsedMood, MediaItem, ActiveFilters } from '@/types';

export function scoreAndFilterMovies(
  movies: MediaItem[],
  mood: ParsedMood,
  originalMoodText: string,
  manualFilters: ActiveFilters | undefined,
  limit: number = 5,
  isPerfectPick: boolean = false
): MediaItem[] {
  
  const INDIAN_LANGS = ['hi', 'ta', 'te', 'ml', 'kn'];
  
  // 1. STRICT FILTERING
  const filtered = movies.filter(movie => {
    if (!movie.poster_path || !movie.overview || movie.overview.length < 30) return false;

    // STRICT: Primary Genres - MUST match AT LEAST ONE
    if (mood.primary_genres && mood.primary_genres.length > 0) {
      const hasAtLeastOnePrimary = mood.primary_genres.some(id => movie.genre_ids.includes(id));
      if (!hasAtLeastOnePrimary) return false;
    }

    // STRICT: Manual Industry Filter
    if (manualFilters?.language) {
      if (manualFilters.language === 'indian') {
         if (!INDIAN_LANGS.includes(movie.original_language)) return false;
      } else {
         if (movie.original_language !== manualFilters.language) return false;
      }
    }

    // STRICT: Keyword Requirement (100% Accuracy enforcement)
    // We require the movie's overview or title to contain at least 50% of the exact extracted keywords
    // to prevent rejecting movies that have a slight mismatch in phrasing but are exactly what they want.
    if (mood.exact_keywords && mood.exact_keywords.length > 0) {
      const textToSearch = `${movie.title} ${movie.overview}`.toLowerCase();
      let matchCount = 0;
      
      mood.exact_keywords.forEach(keyword => {
        if (textToSearch.includes(keyword.toLowerCase())) {
          matchCount++;
        }
      });

      const requiredMatches = Math.max(1, Math.ceil(mood.exact_keywords.length * 0.5));
      if (matchCount < requiredMatches) {
        return false;
      }
    }

    return true;
  });

  // 2. SCORING
  const scoredMovies = filtered.map(movie => {
    let score = 0;
    const overviewLower = movie.overview.toLowerCase();

    // A. Bonus for matching ALL primary genres
    if (mood.primary_genres && mood.primary_genres.length > 1) {
       const hasAllPrimary = mood.primary_genres.every(id => movie.genre_ids.includes(id));
       if (hasAllPrimary) score += 50;
    }

    // B. Semantic Keyword / Theme Match (VERY HIGH)
    let keywordMatches = 0;
    if (mood.themes && mood.themes.length > 0) {
      mood.themes.forEach(theme => {
        if (overviewLower.includes(theme.toLowerCase())) {
          keywordMatches += 1;
        }
      });
    } else {
      const words = originalMoodText.toLowerCase().split(/\s+/);
      words.forEach(w => {
         if (w.length > 3 && overviewLower.includes(w)) keywordMatches += 1;
      });
    }
    score += keywordMatches * 60; // Huge boost for thematic relevance

    // C. Secondary Genres (HIGH)
    if (mood.secondary_genres && mood.secondary_genres.length > 0) {
      const secMatchCount = movie.genre_ids.filter(id => mood.secondary_genres.includes(id)).length;
      score += secMatchCount * 30;
    }

    // D. Rating (MEDIUM)
    score += movie.vote_average * 8; 

    // E. Popularity (LOW)
    // We cap popularity impact to ensure highly relevant obscure movies can beat Marvel movies
    score += Math.min(Math.log10(movie.popularity + 1) * 3, 10);

    // F. Manual Soft Filters
    if (manualFilters) {
      if (manualFilters.genre && movie.genre_ids.includes(manualFilters.genre)) {
        score += 40;
      }
      if (manualFilters.moodEmoji) {
        const happyGenres = [35, 10751, 16];
        const sadGenres = [18];
        const intenseGenres = [28, 53, 27];
        
        let applies = false;
        if (manualFilters.moodEmoji === '😄' && movie.genre_ids.some(id => happyGenres.includes(id))) applies = true;
        if (manualFilters.moodEmoji === '😢' && movie.genre_ids.some(id => sadGenres.includes(id))) applies = true;
        if (manualFilters.moodEmoji === '🔥' && movie.genre_ids.some(id => intenseGenres.includes(id))) applies = true;
        
        if (applies) score += 40;
      }
    }

    return { movie, score };
  });

  // 3. SORT
  scoredMovies.sort((a, b) => b.score - a.score);

  // 4. RANDOMIZATION / PERFECT PICK
  if (isPerfectPick) {
    // If Perfect Pick, ALWAYS return exactly the #1 scored item.
    return scoredMovies.slice(0, 1).map(item => item.movie);
  } else {
    // Standard request: Avoid Repetition by picking 'limit' items randomly from the top 15.
    const topPoolSize = Math.min(15, scoredMovies.length);
    if (topPoolSize <= limit) {
       return scoredMovies.map(item => item.movie);
    }
    
    // Shuffle the top 15 and take 5
    const topPool = scoredMovies.slice(0, topPoolSize);
    for (let i = topPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [topPool[i], topPool[j]] = [topPool[j], topPool[i]];
    }
    
    return topPool.slice(0, limit).map(item => item.movie);
  }
}
