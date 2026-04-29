import { motion } from 'framer-motion';
import { Play, Star, Clock } from 'lucide-react';
import { MovieRecommendation } from '@/types';

interface MovieCardProps {
  movie: MovieRecommendation;
  onPlayTrailer: (key: string) => void;
  index: number;
}

export default function MovieCard({ movie, onPlayTrailer, index }: MovieCardProps) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-2xl glass overflow-hidden hover:bg-zinc-900/80 transition-all duration-300 border border-zinc-800 hover:border-red-500/30 shadow-xl"
    >
      {/* Background blur effect */}
      {movie.backdrop_path && (
        <div 
          className="absolute inset-0 z-[-1] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 bg-cover bg-center"
          style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})` }}
        />
      )}

      {/* Poster */}
      <div className="relative shrink-0 w-full md:w-48 aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-zinc-800">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {movie.trailer_key && (
          <button
            onClick={() => onPlayTrailer(movie.trailer_key!)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] transform scale-90 group-hover:scale-100 transition-transform">
              <Play fill="currentColor" className="ml-1" size={24} />
            </div>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-red-400 transition-colors">
            {movie.title}
            <span className="text-lg font-normal text-zinc-400 ml-3">
              {new Date(movie.release_date).getFullYear()}
            </span>
          </h3>
          <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-full border border-zinc-800 shrink-0">
            <Star className="text-yellow-500" fill="currentColor" size={16} />
            <span className="font-bold text-white">{movie.vote_average.toFixed(1)}</span>
          </div>
        </div>

        {/* AI Explanation */}
        <div className="mt-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-orange-500" />
          <p className="text-zinc-300 text-sm md:text-base leading-relaxed italic">
            "{movie.explanation}"
          </p>
        </div>

        {/* Details & Providers */}
        <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            {/* We could add runtime here if we fetched detailed movie info, but basic TMDB discover doesn't return runtime. We could just skip or add a mock if missing */}
          </div>

          <div className="flex items-center gap-3">
            {movie.streaming_info?.flatrate ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mr-2">Stream on</span>
                <div className="flex -space-x-2">
                  {movie.streaming_info.flatrate.slice(0, 3).map((provider) => (
                    <img
                      key={provider.provider_id}
                      src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                      alt={provider.provider_name}
                      title={provider.provider_name}
                      className="w-8 h-8 rounded-full border-2 border-zinc-900 z-10"
                    />
                  ))}
                </div>
              </div>
            ) : movie.streaming_info?.rent ? (
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Available to Rent</span>
            ) : (
              <span className="text-xs text-zinc-600 uppercase tracking-wider font-semibold">No streaming data</span>
            )}
            
            {movie.trailer_key && (
               <button
                 onClick={() => onPlayTrailer(movie.trailer_key!)}
                 className="md:hidden ml-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
               >
                 <Play size={16} fill="currentColor" /> Trailer
               </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
