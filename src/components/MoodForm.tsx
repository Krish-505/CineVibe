import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';

interface MoodFormProps {
  onSubmit: (mood: string, isPerfectPick: boolean) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  "I want a mind-bending sci-fi that makes me think",
  "Feeling sad, need a heartwarming comedy to cheer me up",
  "Fast-paced action with great choreography",
  "A visually stunning fantasy world to escape into",
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-3xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <div className="relative glass rounded-2xl p-2 sm:p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <textarea
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="How are you feeling? What's your vibe today?"
              className="w-full bg-transparent text-white placeholder-zinc-500 p-4 resize-none focus:outline-none min-h-[60px] sm:h-16 rounded-xl text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto px-2 sm:px-0 pb-2 sm:pb-0">
            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer select-none group/toggle">
              <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${isPerfectPick ? 'bg-red-500' : 'bg-zinc-700'}`}>
                <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${isPerfectPick ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className={`transition-colors ${isPerfectPick ? 'text-white' : ''}`}>Perfect Pick</span>
            </label>
            <button
              type="submit"
              disabled={isLoading || !mood.trim()}
              className="ml-auto sm:ml-0 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 transform active:scale-95 shadow-lg shadow-red-900/20"
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
                  Find
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => setMood(suggestion)}
            className="text-xs sm:text-sm px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
