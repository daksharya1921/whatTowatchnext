import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Loader2, ArrowRight } from 'lucide-react';

interface QuickPickProps {
  onSelect: (title: string) => void;
}

const QUICK_PICKS = [
  'Inception', 'Interstellar', 'The Dark Knight', 'Parasite', 'Whiplash',
  'The Shawshank Redemption', 'Pulp Fiction', 'Fight Club', 'The Matrix',
  'Spirited Away', 'Goodfellas', 'Se7en', 'The Prestige', 'Memento',
  'No Country for Old Men', 'There Will Be Blood', 'Mad Max: Fury Road',
  'Blade Runner 2049', 'Arrival', 'Dune', 'Everything Everywhere All at Once',
  'The Grand Budapest Hotel', 'Oppenheimer', 'Joker', 'Get Out',
  'Breaking Bad', 'Stranger Things', 'The Bear', 'Severance', 'Shogun',
  'The Last of Us', 'Succession', 'Dark', 'Chernobyl', 'Band of Brothers',
];

export default function QuickPick({ onSelect }: QuickPickProps) {
  const [currentPick, setCurrentPick] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    if (rolling) return;
    setRolling(true);

    let count = 0;
    const maxRolls = 12;
    const interval = setInterval(() => {
      const random = QUICK_PICKS[Math.floor(Math.random() * QUICK_PICKS.length)];
      setCurrentPick(random);
      count++;
      if (count >= maxRolls) {
        clearInterval(interval);
        setRolling(false);
      }
    }, 100);
  };

  return (
    <div className="flex items-center gap-3">
      <motion.button
        onClick={roll}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 bg-card/60 backdrop-blur-md text-foreground border border-border px-5 py-3 rounded-xl font-bold text-sm hover:border-primary/30 transition-all"
      >
        <motion.span
          animate={rolling ? { rotate: [0, 360] } : {}}
          transition={rolling ? { duration: 0.3, repeat: Infinity, ease: 'linear' } : {}}
        >
          {rolling ? <Loader2 className="w-4 h-4 text-primary" /> : <Dices className="w-4 h-4 text-muted-foreground" />}
        </motion.span>
        <span className="text-muted-foreground">Quick Pick</span>
      </motion.button>

      <AnimatePresence mode="wait">
        {currentPick && !rolling && (
          <motion.button
            key={currentPick}
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => onSelect(currentPick)}
            className="flex items-center gap-2 bg-card/60 backdrop-blur-md border border-primary/30 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group hover:border-primary/60"
          >
            <span className="text-primary font-bold">{currentPick}</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
