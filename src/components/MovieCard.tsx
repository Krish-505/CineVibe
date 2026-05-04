import { motion } from 'framer-motion';
import { Star, Calendar } from 'lucide-react';
import Link from 'next/link';
import { MovieRecommendation } from '@/types';

interface MovieCardProps {
  movie: MovieRecommendation;
  onPlayTrailer: (key: string) => void;
  index: number;
}

export default function MovieCard({ movie, index }: MovieCardProps) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative flex flex-col sm:flex-row w-full rounded-3xl glass-heavy overflow-hidden transition-all duration-500 ease-out hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(220,38,38,0.15)] border border-white/5 hover:border-red-500/20"
    >
      <Link href={`/title/${movie.type}/${movie.id}?exp=${encodeURIComponent(movie.explanation || '')}`} className="flex flex-col sm:flex-row w-full h-full text-left">
        
        {/* Poster Image Container (Left side on desktop, Top on mobile) */}
        <div className="relative w-full sm:w-48 md:w-56 lg:w-64 shrink-0 aspect-[2/3] sm:aspect-auto overflow-hidden">
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Format Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-zinc-300 uppercase tracking-wider border border-white/10">
              {movie.type === 'tv' ? 'Series' : 'Movie'}
            </span>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-white font-bold text-xs">
            <Star className="text-yellow-500" fill="currentColor" size={12} />
            {movie.vote_average.toFixed(1)}
          </div>
        </div>

        {/* Content Section (Right side on desktop) */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-gradient-to-r from-transparent to-black/40">
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-lg line-clamp-2 mb-2 group-hover:text-red-400 transition-colors">
              {movie.title}
            </h3>
            
            <div className="flex items-center gap-4 text-xs font-medium text-zinc-400 mb-4">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-red-500" />
                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
              </div>
            </div>

            {/* AI Explanation / Highlight */}
            <div className="mb-6">
              <p className="text-sm md:text-base text-zinc-300 leading-relaxed italic border-l-2 border-red-500/50 pl-4 font-light">
                "{movie.explanation}"
              </p>
            </div>
            
            {/* Overview (truncated) */}
            <p className="text-xs md:text-sm text-zinc-500 leading-relaxed line-clamp-3 md:line-clamp-2 max-w-3xl">
              {movie.overview}
            </p>
          </div>

          {/* Streaming Providers Footer */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
             {movie.streaming_info?.flatrate ? (
               <div className="flex items-center gap-3">
                 <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Stream On</span>
                 <div className="flex -space-x-2">
                   {movie.streaming_info.flatrate.slice(0, 4).map((provider) => (
                     <img
                       key={provider.provider_id}
                       src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                       alt={provider.provider_name}
                       title={provider.provider_name}
                       className="w-7 h-7 rounded-full border-2 border-zinc-900 z-10 hover:z-20 hover:scale-110 transition-transform"
                     />
                   ))}
                 </div>
               </div>
             ) : movie.streaming_info?.rent ? (
               <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold bg-white/5 px-2.5 py-1.5 rounded-md border border-white/5">Available for Rent/Buy</span>
             ) : (
               <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">No streaming data available</span>
             )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
