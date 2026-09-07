import React from 'react';
import './HeroCarousel.css';

const images = [
    "public/Assets/Hero/6.png",
    "public/Assets/Hero/7.png",
    "public/Assets/Hero/8.png",
    "public/Assets/Hero/1.png",
    "public/Assets/Hero/2.png",
    "public/Assets/Hero/3.png",
    "public/Assets/Hero/4.png",
    "public/Assets/Hero/5.png",
]
export default function HeroCarousel() {
  return (
    <div className="hero-carousel-container">
      <div className="hero-carousel-track">
        {images.map((src, index) => (
          <div key={index} className="hero-carousel-item">
            <img src={src} alt={`Artwork ${index}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
