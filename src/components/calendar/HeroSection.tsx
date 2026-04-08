import { monthImages, monthNames } from '@/lib/monthImages';

interface HeroSectionProps {
  month: number;
  year: number;
}

export const HeroSection = ({ month, year }: HeroSectionProps) => {
  return (
    <div className="relative w-full aspect-[4/3] overflow-hidden">
      <img
        src={monthImages[month]}
        alt={monthNames[month]}
        className="w-full h-full object-cover"
        width={1024}
        height={768}
      />
      {/* Diagonal blue accent shape */}
      <svg
        className="absolute bottom-0 right-0 w-[60%] h-[40%]"
        viewBox="0 0 300 150"
        preserveAspectRatio="none"
      >
        <polygon points="80,0 300,0 300,150 0,150" fill="hsl(205, 80%, 55%)" />
      </svg>
      {/* Month & Year text on the blue accent */}
      <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 text-right z-10">
        <p className="text-white/90 text-lg sm:text-2xl font-body font-semibold tracking-wider">
          {year}
        </p>
        <h2 className="text-white text-3xl sm:text-5xl md:text-6xl font-bold tracking-wider uppercase font-display">
          {monthNames[month]}
        </h2>
      </div>
    </div>
  );
};
