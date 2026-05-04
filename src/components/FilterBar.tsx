import { ActiveFilters } from '@/types';
import { motion } from 'framer-motion';

interface FilterBarProps {
  filters: ActiveFilters;
  onChange: (newFilters: ActiveFilters) => void;
}

const LANGUAGES = [
  { id: '', label: 'Global' },
  { id: 'en', label: 'Hollywood' },
  { id: 'indian', label: 'Indian' },
  { id: 'ko', label: 'K-Drama' },
  { id: 'ja', label: 'Anime' },
];

const GENRES = [
  { id: undefined, label: 'All Genres' },
  { id: 28, label: 'Action' },
  { id: 53, label: 'Thriller' },
  { id: 878, label: 'Sci-Fi' },
  { id: 35, label: 'Comedy' },
  { id: 27, label: 'Horror' },
  { id: 18, label: 'Drama' },
  { id: 10749, label: 'Romance' },
];

const MOODS = [
  { id: undefined, emoji: '✨', label: 'Any' },
  { id: '😄', emoji: '😄', label: 'Happy' },
  { id: '😢', emoji: '😢', label: 'Sad' },
  { id: '🔥', emoji: '🔥', label: 'Intense' },
  { id: '😌', emoji: '😌', label: 'Chill' },
  { id: '🤯', emoji: '🤯', label: 'Mind-blowing' },
];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const updateFilter = (key: keyof ActiveFilters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 w-full p-4 md:p-6 rounded-3xl glass border border-white/5 shadow-2xl backdrop-blur-2xl"
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        
        {/* Content Type */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Format</span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'both', label: 'All' },
              { id: 'movie', label: 'Movies' },
              { id: 'tv', label: 'Series' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => updateFilter('contentType', type.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  (filters.contentType || 'both') === type.id
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Industry / Language */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Industry</span>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id || 'all'}
                onClick={() => updateFilter('language', lang.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  filters.language === lang.id
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Genres */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Genre</span>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                key={g.label}
                onClick={() => updateFilter('genre', g.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  filters.genre === g.id
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mood Emojis */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Vibe</span>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.label}
                onClick={() => updateFilter('moodEmoji', m.id)}
                title={m.label}
                className={`px-3 py-1.5 rounded-full text-lg transition-all duration-300 ${
                  filters.moodEmoji === m.id
                    ? 'bg-white/20 scale-110 shadow-inner'
                    : 'bg-transparent opacity-60 hover:opacity-100 hover:bg-white/10'
                }`}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
