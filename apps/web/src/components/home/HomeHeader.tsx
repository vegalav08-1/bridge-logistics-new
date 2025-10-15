export default function HomeHeader() {
  return (
    <div className="flex items-center justify-center py-4 md:py-6">
      <div className="flex items-center gap-2 md:gap-3">
        {/* логотип можно SVG/из assets */}
        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-[var(--brand)] grid place-items-center text-white font-bold text-sm md:text-base">A</div>
        <div className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide">
          <span>BRI</span><span className="text-[var(--brand)]">D</span><span>GE</span>
        </div>
      </div>
    </div>
  );
}


