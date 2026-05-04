import { getDetails, getCredits, getSimilar, getTrailer, getWatchProviders } from '@/lib/services/tmdb.service';
import { Star, Calendar, Clock, ArrowLeft, Play, Tv } from 'lucide-react';
import Link from 'next/link';
import CastList from '@/components/CastList';

interface DetailPageProps {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TitleDetail(props: DetailPageProps) {
  // Await params and searchParams for Next.js 15+ compatibility
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const { type, id } = params;
  const explanation = searchParams?.exp ? decodeURIComponent(searchParams.exp as string) : null;
  
  let details, castData, similar, trailerKey, streamingInfo;

  try {
    [details, castData, similar, trailerKey, streamingInfo] = await Promise.all([
      getDetails(parseInt(id), type as 'movie' | 'tv'),
      getCredits(parseInt(id), type as 'movie' | 'tv') as any, // Need raw response to get crew
      getSimilar(parseInt(id), type as 'movie' | 'tv'),
      getTrailer(parseInt(id), type as 'movie' | 'tv'),
      getWatchProviders(parseInt(id), type as 'movie' | 'tv')
    ]);
  } catch (err) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Content Not Found</h1>
        <p className="text-zinc-400 mb-8">We couldn't fetch details for this {type}. It might have been removed or the ID is incorrect.</p>
        <Link href="/" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  if (!details || details.success === false) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Content Not Found</h1>
        <p className="text-zinc-400 mb-8">We couldn't fetch details for this {type}. It might have been removed or the ID is incorrect.</p>
        <Link href="/" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'Unknown';
  
  // Format Runtime
  let runtimeStr = '';
  if (type === 'movie' && details.runtime) {
    const hours = Math.floor(details.runtime / 60);
    const mins = details.runtime % 60;
    runtimeStr = `${hours}h ${mins}m`;
  } else if (type === 'tv' && details.episode_run_time?.length > 0) {
    runtimeStr = `${details.episode_run_time[0]}m per ep`;
  }

  const backdropUrl = details.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` 
    : '';

  // Extract Cast and Director
  const cast = castData.cast?.slice(0, 10) || [];
  const director = castData.crew?.find((c: any) => c.job === 'Director');

  return (
    <div className="relative min-h-screen bg-black text-white pb-24">
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-zinc-300 hover:text-white hover:bg-black/80 transition-all border border-white/10">
          <ArrowLeft size={20} /> Back
        </Link>
      </div>

      {/* Cinematic Hero Backdrop */}
      <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh]">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backdropUrl})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 -mt-64 md:-mt-80">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-end md:items-start">
          
          {/* Poster & Actions */}
          <div className="hidden md:block w-64 lg:w-80 shrink-0">
            <div className="rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 mb-6 bg-zinc-900 aspect-[2/3]">
              {details.poster_path && (
                <img src={`https://image.tmdb.org/t/p/w500${details.poster_path}`} alt={title} className="w-full h-auto" />
              )}
            </div>

            {trailerKey && (
              <a 
                href={`#trailer-section`}
                className="w-full flex items-center justify-center gap-3 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
              >
                <Play fill="currentColor" size={20} /> Watch Trailer
              </a>
            )}

            {/* Streaming Info on Sidebar */}
            {(streamingInfo?.flatrate || streamingInfo?.rent || streamingInfo?.buy) && (
              <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Where to Watch</h4>
                
                {streamingInfo.flatrate && (
                  <div className="mb-4">
                    <span className="text-xs text-zinc-400 block mb-2">Stream</span>
                    <div className="flex flex-wrap gap-2">
                      {streamingInfo.flatrate.map((provider: any) => (
                        <img key={provider.provider_id} src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`} alt={provider.provider_name} title={provider.provider_name} className="w-10 h-10 rounded-xl" />
                      ))}
                    </div>
                  </div>
                )}

                {(streamingInfo.rent || streamingInfo.buy) && (
                  <div>
                    <span className="text-xs text-zinc-400 block mb-2">Rent / Buy</span>
                    <div className="flex flex-wrap gap-2">
                      {(streamingInfo.rent || streamingInfo.buy).slice(0,4).map((provider: any) => (
                        <img key={provider.provider_id} src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`} alt={provider.provider_name} title={provider.provider_name} className="w-8 h-8 rounded-lg opacity-80" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 pb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
               <span className="px-3 py-1 bg-red-600/20 text-red-500 font-bold tracking-widest uppercase text-xs rounded-full border border-red-500/30">
                 {type === 'movie' ? 'Movie' : 'Series'}
               </span>
               {type === 'tv' && details.number_of_seasons && (
                 <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white font-bold tracking-widest uppercase text-xs rounded-full border border-white/10">
                   <Tv size={14} /> {details.number_of_seasons} Seasons ({details.number_of_episodes} Episodes)
                 </span>
               )}
               {director && (
                 <span className="text-sm text-zinc-400 font-medium">Directed by <strong className="text-white">{director.name}</strong></span>
               )}
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4 drop-shadow-xl">{title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-zinc-300 font-medium text-sm md:text-base mb-6 drop-shadow-md">
              <div className="flex items-center gap-1.5 text-white bg-white/10 px-3 py-1 rounded-md backdrop-blur-md">
                <Star className="text-yellow-500" fill="currentColor" size={16} />
                {details.vote_average?.toFixed(1)}
              </div>
              <div className="flex items-center gap-1.5"><Calendar size={16} /> {year}</div>
              {runtimeStr && <div className="flex items-center gap-1.5"><Clock size={16} /> {runtimeStr}</div>}
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {details.genres?.map((g: any) => (
                <span key={g.id} className="px-4 py-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm text-sm">
                  {g.name}
                </span>
              ))}
            </div>

            {/* AI Explanation Injection */}
            {explanation && (
              <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-red-900/20 to-black border border-red-500/20">
                <h3 className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">Why this matches your vibe</h3>
                <p className="text-white text-lg font-light italic leading-relaxed">"{explanation}"</p>
              </div>
            )}

            <h3 className="text-xl font-bold text-white mb-3">Overview</h3>
            <p className="text-lg text-zinc-400 leading-relaxed font-light max-w-4xl">
              {details.overview}
            </p>

            {details.production_companies && details.production_companies.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-4 items-center opacity-60 grayscale hover:grayscale-0 transition-all">
                {details.production_companies.slice(0,3).map((company: any) => 
                  company.logo_path ? (
                    <img key={company.id} src={`https://image.tmdb.org/t/p/w200${company.logo_path}`} alt={company.name} className="h-8 object-contain bg-white/10 p-1 rounded-md" />
                  ) : (
                    <span key={company.id} className="text-xs text-zinc-500 font-bold uppercase">{company.name}</span>
                  )
                )}
              </div>
            )}

            {trailerKey && (
              <div id="trailer-section" className="mt-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-video max-w-4xl bg-black scroll-mt-24">
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?rel=0`}
                  title="Trailer"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            )}

            <div className="mt-12 max-w-4xl">
              <CastList cast={cast} />
            </div>

          </div>
        </div>
        
        {similar.length > 0 && (
          <div className="mt-20 pt-10 border-t border-white/10">
            <h3 className="text-2xl font-bold text-white mb-8">More Like This</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4">
              {similar.map((item) => (
                <Link key={item.id} href={`/title/${type}/${item.id}`} className="group block rounded-xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                  <div className="aspect-[2/3] w-full">
                    {item.poster_path && (
                      <img src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
