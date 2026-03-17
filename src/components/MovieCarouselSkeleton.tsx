export default function MovieCarouselSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden pb-3">
      {[...Array(6)].map((_, i) => (
        <div 
          key={i} 
          className="shrink-0 w-[160px] md:w-[200px] aspect-[2/3] bg-white/5 animate-pulse rounded-md"
        />
      ))}
    </div>
  );
}
