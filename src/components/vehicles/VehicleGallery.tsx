import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VehicleGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length <= 1) {
    return (
      <div className="rounded-xl overflow-hidden bg-muted aspect-video lg:aspect-[4/3]">
        <img src={photos[0]} alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  }

  const goTo = (index: number) => {
    setActiveIndex(((index % photos.length) + photos.length) % photos.length);
  };

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl overflow-hidden bg-muted aspect-video lg:aspect-[4/3]">
        <img src={photos[activeIndex]} alt={`${alt} photo ${activeIndex + 1}`} className="w-full h-full object-cover" />

        <button
          type="button"
          aria-label="Previous photo"
          onClick={() => goTo(activeIndex - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow hover:bg-background"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next photo"
          onClick={() => goTo(activeIndex + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow hover:bg-background"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-2">
        {photos.map((photo, index) => (
          <button
            key={photo}
            type="button"
            aria-label={`Show photo ${index + 1}`}
            onClick={() => goTo(index)}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              index === activeIndex ? "bg-gold" : "bg-muted-foreground/30 hover:bg-muted-foreground/60",
            )}
          />
        ))}
      </div>
    </div>
  );
}
