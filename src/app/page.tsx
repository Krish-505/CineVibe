'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film } from 'lucide-react';
import MoodForm from '@/components/MoodForm';
import MovieCard from '@/components/MovieCard';
import TrailerModal from '@/components/TrailerModal';
import { MovieRecommendation } from '@/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [currentMood, setCurrentMood] = useState('');
  const [currentIsPerfectPick, setCurrentIsPerfectPick] = useState(false);
  const [refinements, setRefinements] = useState<string[]>([]);
  const [activeTrailer, setActiveTrailer] = useState<string | null>(null);

  const fetchRecommendations = async (mood: string, isPerfectPick: boolean, newRefinements: string[] = []) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mood, 
          isPerfectPick,
          refinements: newRefinements 
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
    }
  };

  const handleInitialSubmit = (mood: string, isPerfectPick: boolean) => {
    fetchRecommendations(mood, isPerfectPick, []);
  };

  const handleRefinement = (refinement: string) => {
    const newRefinements = [...refinements, refinement];
    fetchRecommendations(currentMood, currentIsPerfectPick, newRefinements);
  };

  const REFINEMENT_OPTIONS = [
    "More intense", "Less emotional", "Shorter", "More fun", "Darker tone", "More action"
  ];

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-20 px-4 sm:px-6 w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-red-600 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)]">
            <Film size={32} className="text-white" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
            CineVibe
          </h1>
        </div>
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto">
          Tell us exactly how you feel. Our AI will curate the perfect cinematic experience for your current mood.
        </p>
      </motion.div>

      {/* Main Input */}
      <div className="w-full mb-16 relative z-10">
        <MoodForm onSubmit={handleInitialSubmit} isLoading={isLoading && recommendations.length === 0} />
      </div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg p-4 mb-8 text-center w-full max-w-2xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State (when recommendations exist but we are refining) */}
      <AnimatePresence>
        {isLoading && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xl font-semibold text-white tracking-widest uppercase">Refining Picks...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="w-full flex flex-col gap-8">
        <AnimatePresence mode="popLayout">
          {recommendations.map((movie, index) => (
            <MovieCard 
              key={`${movie.id}-${index}`} 
              movie={movie} 
              index={index}
              onPlayTrailer={setActiveTrailer}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Refinement Options */}
      <AnimatePresence>
        {recommendations.length > 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 w-full max-w-4xl mx-auto border-t border-zinc-800 pt-8"
          >
            <h4 className="text-center text-zinc-400 mb-6 font-medium">Not quite right? Tweak the vibe:</h4>
            <div className="flex flex-wrap justify-center gap-3">
              {REFINEMENT_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => handleRefinement(option)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 hover:border-red-500/50 text-zinc-300 transition-all hover:-translate-y-1"
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
