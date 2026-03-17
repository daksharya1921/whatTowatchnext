import { motion } from 'framer-motion';

interface MovieCardSkeletonRowProps {
  count?: number;
}

export default function MovieCardSkeletonRow({ count = 6 }: MovieCardSkeletonRowProps) {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="shrink-0 w-[140px] md:w-[160px]"
        >
          <div className="panel overflow-hidden">
            <div className="aspect-[2/3] relative bg-[var(--deep)]">
              <div className="absolute inset-0 skeleton-shimmer" />
            </div>
            <div className="p-2.5 space-y-2">
              <div className="h-3 w-4/5 bg-[var(--cream-06)] rounded-sm skeleton-shimmer" />
              <div className="h-2 w-1/2 bg-[var(--cream-06)] rounded-sm skeleton-shimmer" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
