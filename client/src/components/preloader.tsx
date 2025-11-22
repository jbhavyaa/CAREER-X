import { useEffect, useState } from "react";
import campusImage from "@assets/generated_images/Mody_Bg.jpg";

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundImage: `linear-gradient(rgba(0, 56, 147, 0.7), rgba(0, 56, 147, 0.7)), url(${campusImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Mody University
          </h1>
          <h2 className="text-xl md:text-2xl text-white/90">
            Placement Portal
          </h2>
        </div>
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gold/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
