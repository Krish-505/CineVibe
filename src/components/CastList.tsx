import { CastMember } from '@/types';

interface CastListProps {
  cast: CastMember[];
}

export default function CastList({ cast }: CastListProps) {
  if (!cast || cast.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-white mb-4">Top Cast</h3>
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
        {cast.map((actor) => (
          <div key={actor.id} className="flex-shrink-0 w-28 md:w-32 group">
            <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-zinc-900 border border-white/10 mb-3">
              {actor.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                  alt={actor.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                  No Image
                </div>
              )}
            </div>
            <h4 className="text-sm font-bold text-white leading-tight truncate">{actor.name}</h4>
            <p className="text-xs text-zinc-500 truncate mt-1">{actor.character}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
