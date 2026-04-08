export const SpiralBinding = () => {
  const rings = Array.from({ length: 16 });

  return (
    <div className="relative w-full h-6 sm:h-8 flex items-center justify-center z-20">
      <div className="flex items-center justify-between w-[88%]">
        {rings.map((_, i) => (
          <div key={i} className="relative flex flex-col items-center">
            <div
              className="w-3.5 h-4.5 sm:w-5 sm:h-6 rounded-t-full border-[2.5px] border-b-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(8,8,8,1) 55%, rgba(40,40,40,1) 100%)",
                borderColor: "rgba(10,10,10,0.95)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.10), 0 3px 10px rgba(0,0,0,0.22)",
              }}
            />
            {/* tiny highlight bead */}
            <div
              className="absolute top-1.5 sm:top-2 h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.22)" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
