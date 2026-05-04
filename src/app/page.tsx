'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film } from 'lucide-react';
import MoodForm from '@/components/MoodForm';
import MovieCard from '@/components/MovieCard';
import TrailerModal from '@/components/TrailerModal';
import FilterBar from '@/components/FilterBar';
import { MovieRecommendation, ActiveFilters } from '@/types';

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-3xl glass-heavy overflow-hidden animate-pulse aspect-[2/3] w-full">
      <div className="flex-1 bg-white/5 w-full h-full" />
      <div className="h-32 bg-zinc-900 p-5 flex flex-col justify-end gap-3">
        <div className="h-4 w-3/4 bg-white/5 rounded-md" />
        <div className="h-3 w-full bg-white/5 rounded-md" />
        <div className="h-3 w-4/5 bg-white/5 rounded-md" />
      </div>
    </div>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [currentMood, setCurrentMood] = useState('');
  const [currentIsPerfectPick, setCurrentIsPerfectPick] = useState(false);
  const [refinements, setRefinements] = useState<string[]>([]);
  const [activeTrailer, setActiveTrailer] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActiveFilters>({ contentType: 'both' });

  const fetchRecommendations = async (mood: string, isPerfectPick: boolean, newRefinements: string[] = [], activeFilters: ActiveFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mood, 
          isPerfectPick,
          refinements: newRefinements,
          filters: activeFilters
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch recommendations');
      }

      setRecommendations(data.recommendations);
      setCurrentMood(mood);
      setCurrentIsPerfectPick(isPerfectPick);
      setRefinements(newRefinements);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handleInitialSubmit = (mood: string, isPerfectPick: boolean) => {
    setRecommendations([]); 
    setRefinements([]);
    fetchRecommendations(mood, isPerfectPick, [], filters);
  };

  const handleRefinement = (refinement: string) => {
    const newRefinements = [...refinements, refinement];
    setRecommendations([]);
    fetchRecommendations(currentMood, currentIsPerfectPick, newRefinements, filters);
  };

  const REFINEMENT_OPTIONS = [
    "More intense", "Less emotional", "Shorter runtime", "More fun", "Darker tone", "Unexpected twist"
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center pt-24 pb-24 px-4 sm:px-6 w-full max-w-7xl mx-auto overflow-hidden">
      
      {/* Background Graphic elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/10 blur-[150px] pointer-events-none z-[-1]" />
      <div className="fixed top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-orange-900/5 blur-[150px] pointer-events-none z-[-1]" />
      <div className="fixed bottom-[-10%] left-[20%] w-[30%] h-[40%] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none z-[-1]" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-12 relative z-10"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-red-600 to-red-900 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.4)]">
            <Film size={48} className="text-white" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500 pb-2">
            CineVibe
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-2xl mx-auto tracking-wide">
          The intelligent cinematic engine. Tell us your mood, we'll find the perfect watch.
        </p>
      </motion.div>

      {/* Main Input & Filters */}
      <div className="w-full mb-16 relative z-10 flex flex-col gap-6 max-w-4xl mx-auto">
        <MoodForm onSubmit={handleInitialSubmit} isLoading={isLoading} />
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-red-400 bg-red-950/40 border border-red-900/50 rounded-2xl p-6 mb-12 text-center w-full max-w-2xl backdrop-blur-md shadow-2xl relative z-10"
          >
            <p className="font-semibold text-lg">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Container - Compact Responsive Grid */}
      <div className="w-full relative z-10">
        
        {/* Loading Skeletons */}
        {isLoading && recommendations.length === 0 && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }}
             className={`grid gap-6 md:gap-8 ${currentIsPerfectPick ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'}`}
           >
             <SkeletonCard />
             {!currentIsPerfectPick && <SkeletonCard />}
             {!currentIsPerfectPick && <SkeletonCard />}
             {!currentIsPerfectPick && <SkeletonCard />}
             {!currentIsPerfectPick && <SkeletonCard />}
           </motion.div>
        )}

        {/* Real Cards */}
        <AnimatePresence mode="popLayout">
          {!isLoading && recommendations.length > 0 && (
            <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
              {recommendations.map((movie, index) => (
                <MovieCard 
                  key={`${movie.id}-${index}`} 
                  movie={movie} 
                  index={index}
                  onPlayTrailer={setActiveTrailer}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Explore Section when Empty */}
      {!isLoading && recommendations.length === 0 && !error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-zinc-500 relative z-10"
        >
          <p className="text-lg font-medium">Ready to discover something new?</p>
          <p className="text-sm mt-2">Use the "Surprise Me" button above or type your exact mood.</p>
        </motion.div>
      )}

      {/* Refinement Options */}
      <AnimatePresence>
        {recommendations.length > 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-24 w-full max-w-4xl mx-auto border-t border-white/5 pt-12 relative z-10"
          >
            <div className="text-center mb-8">
              <h4 className="text-2xl text-zinc-300 font-bold tracking-tight">Evolve your vibe</h4>
              <p className="text-sm text-zinc-500 mt-2">Add a dynamic refinement to instantly pivot the recommendations.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {REFINEMENT_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => handleRefinement(option)}
                  className="px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 font-medium transition-all hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)] hover:border-red-500/30 backdrop-blur-md"
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trailer Modal */}
      <TrailerModal 
        trailerKey={activeTrailer} 
        onClose={() => setActiveTrailer(null)} 
      />

    </div>
  );
}
