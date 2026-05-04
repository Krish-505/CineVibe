import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Dices } from 'lucide-react';

interface MoodFormProps {
  onSubmit: (mood: string, isPerfectPick: boolean) => void;
  isLoading: boolean;
}

const SURPRISE_PROMPTS = [
  "A mind-bending psychological thriller that questions reality.",
  "A heartwarming animated movie to make me cry happy tears.",
  "Fast-paced martial arts action with incredible choreography.",
  "A visually stunning space epic.",
  "A hilarious buddy cop comedy from the 2000s.",
  "Dark, brooding crime drama set in a rainy city."
];

export default function MoodForm({ onSubmit, isLoading }: MoodFormProps) {
  const [mood, setMood] = useState('');
  const [isPerfectPick, setIsPerfectPick] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim() && !isLoading) {
      onSubmit(mood.trim(), isPerfectPick);
    }
  };

  const handleSurpriseMe = () => {
    const randomPrompt = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    setMood(randomPrompt);
    onSubmit(randomPrompt, isPerfectPick);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-orange-500 to-purple-600 rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
        <div className="relative glass-heavy rounded-3xl p-3 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <textarea
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="Describe your perfect cinematic experience..."
              className="w-full bg-transparent text-white placeholder-zinc-500 p-4 resize-none focus:outline-none min-h-[60px] sm:h-16 rounded-xl text-lg font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto px-2 sm:px-0 pb-2 sm:pb-0">
            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer select-none group/toggle">
              <div 
                onClick={() => {
                  const newState = !isPerfectPick;
                  setIsPerfectPick(newState);
                  if (mood.trim() && !isLoading) onSubmit(mood.trim(), newState);
                }}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isPerfectPick ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 pointer-events-none ${isPerfectPick ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
              <span className={`transition-colors font-bold tracking-wide uppercase text-xs ${isPerfectPick ? 'text-white' : ''}`}>Perfect Pick</span>
            </label>
            
            <div className="flex gap-2 ml-auto sm:ml-0">
              <button
                type="button"
                onClick={handleSurpriseMe}
                disabled={isLoading}
                title="Surprise Me"
                className="px-4 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white rounded-2xl transition-all flex items-center justify-center transform active:scale-95"
              >
                <Dices size={20} />
              </button>
              
              <button
                type="submit"
                disabled={isLoading || !mood.trim()}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white rounded-2xl font-bold transition-all flex items-center gap-2 transform active:scale-95 shadow-lg shadow-red-900/30"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Search size={20} />
                  </motion.div>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Discover
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
