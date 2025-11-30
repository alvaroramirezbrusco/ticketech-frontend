import { useEffect, useState } from "react";
import banner1 from "../../../../public/banners/banner1.webp";
import banner2 from "../../../../public/banners/banner2.webp";
import banner3 from "../../../../public/banners/banner3.webp";
import "./css/HeroCarousel.css";

const banners = [banner1, banner2, banner3];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  const next = () => {
    setIndex((i) => (i + 1) % banners.length);
  };

  const prev = () => {
    setIndex((i) => (i - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hero-carousel-container relative">

      {/* Botón Izquierdo */}
      <button
        onClick={prev}
        className="absolute left-7 top-1/2 z-10
                   bg-black/40 hover:bg-black/60 text-white
                   w-10 h-10 rounded-full flex items-center justify-center"
      >
        ◀
      </button>

      {/* Carrusel */}
      <div className="hero-carousel">
        <img src={banners[index]} />
      </div>

      {/* Botón Derecho */}
      <button
        onClick={next}
        className="absolute right-7 top-1/2  z-10
                   bg-black/40 hover:bg-black/60 text-white
                   w-10 h-10 rounded-full flex items-center justify-center"
      >
        ▶
      </button>

      {/* Puntos */}
      <div className="hero-dots">
        {banners.map((_, i) => (
          <div
            key={i}
            className={`hero-dot ${i === index ? "active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
